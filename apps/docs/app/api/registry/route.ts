import { BlocksStore } from "@blocksai/store";
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
