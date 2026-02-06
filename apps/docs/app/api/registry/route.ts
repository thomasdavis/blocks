import { BlocksStore } from "@blocksai/store";
import { createClient } from "@libsql/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    return NextResponse.json(
      { error: "Registry not configured" },
      { status: 503 },
    );
  }

  try {
    const store = new BlocksStore(url, { authToken });
    await store.initialize();
    const config = await store.toBlocksConfig();
    await store.close();

    // Merge user-submitted blocks
    try {
      const client = createClient({ url, authToken });
      const result = await client.execute(
        "SELECT name, description, inputs, outputs FROM block_submissions ORDER BY created_at DESC",
      );
      client.close();

      for (const row of result.rows) {
        const blockName = row.name as string;
        if (!config.blocks[blockName]) {
          config.blocks[blockName] = {
            description: row.description as string,
            inputs: row.inputs ? JSON.parse(row.inputs as string) : undefined,
            outputs: row.outputs
              ? JSON.parse(row.outputs as string)
              : undefined,
          };
        }
      }
    } catch (subErr: any) {
      // Don't fail the whole response if submissions table doesn't exist yet
      console.warn("Could not fetch user submissions:", subErr.message);
    }

    return NextResponse.json(config, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("Registry fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch registry" },
      { status: 500 },
    );
  }
}
