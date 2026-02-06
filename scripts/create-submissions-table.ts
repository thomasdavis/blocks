/**
 * Create the block_submissions table in Turso.
 *
 * Run: npx tsx scripts/create-submissions-table.ts
 *
 * Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env
 */

import "dotenv/config";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error(
    "Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in environment",
  );
  process.exit(1);
}

async function main() {
  const client = createClient({ url, authToken });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS block_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      inputs TEXT,
      outputs TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  console.log("block_submissions table created successfully");
  client.close();
}

main().catch((err) => {
  console.error("Failed to create table:", err);
  process.exit(1);
});
