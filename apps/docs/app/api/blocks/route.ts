import { getAuth } from "../../../lib/auth";
import { createClient } from "@libsql/client";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getClient() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
}

export async function GET() {
  try {
    const client = getClient();
    const result = await client.execute(
      "SELECT id, user_id, name, description, inputs, outputs, created_at, updated_at FROM block_submissions ORDER BY created_at DESC",
    );
    client.close();

    const submissions = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      inputs: row.inputs ? JSON.parse(row.inputs as string) : null,
      outputs: row.outputs ? JSON.parse(row.outputs as string) : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json(submissions);
  } catch (error: any) {
    console.error("Failed to fetch submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await getAuth().api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, inputs, outputs } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const client = getClient();

    await client.execute({
      sql: `INSERT INTO block_submissions (id, user_id, name, description, inputs, outputs, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        session.user.id,
        name,
        description,
        inputs ? JSON.stringify(inputs) : null,
        outputs ? JSON.stringify(outputs) : null,
        now,
        now,
      ],
    });

    client.close();

    return NextResponse.json({ id, name, description }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create submission:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 },
    );
  }
}
