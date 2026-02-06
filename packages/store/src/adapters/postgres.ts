import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import * as schema from "../schema.js";

export interface PostgresConnection {
  db: NodePgDatabase<any>;
  pool: Pool;
  dialect: "postgres";
}

export async function createPostgresConnection(connectionString: string): Promise<PostgresConnection> {
  try {
    // Dynamic import pg since it's a peer dependency
    const { default: pg } = await import("pg");
    const pool = new pg.Pool({ connectionString });
    const db = drizzle(pool, {
      schema: {
        blocks: schema.pgBlocks,
        entities: schema.pgEntities,
        semantics: schema.pgSemantics,
        config: schema.pgConfig
      }
    });
    return { db, pool, dialect: "postgres" as const };
  } catch (error: any) {
    if (error?.code === "ERR_MODULE_NOT_FOUND" || error?.code === "MODULE_NOT_FOUND" ||
        (error instanceof Error && error.message.includes("Cannot find module"))) {
      throw new Error(
        "PostgreSQL support requires the 'pg' package. Install it with: pnpm add pg"
      );
    }
    throw error;
  }
}
