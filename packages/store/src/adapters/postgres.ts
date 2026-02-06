import * as schema from "../schema.js";

export interface PostgresConnection {
  db: any;
  pool: any;
  dialect: "postgres";
}

export async function createPostgresConnection(connectionString: string): Promise<PostgresConnection> {
  try {
    const { default: pg } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");

    const pool = new pg.Pool({ connectionString });
    const db = drizzle(pool, {
      schema: {
        blocks: schema.pgBlocks,
        entities: schema.pgEntities,
        semantics: schema.pgSemantics,
        config: schema.pgConfig,
      },
    });
    return { db, pool, dialect: "postgres" as const };
  } catch (error: any) {
    if (
      error?.code === "ERR_MODULE_NOT_FOUND" ||
      error?.code === "MODULE_NOT_FOUND" ||
      (error instanceof Error && error.message.includes("Cannot find module"))
    ) {
      throw new Error(
        "PostgreSQL support requires the 'pg' package. Install it with: pnpm add pg",
      );
    }
    throw error;
  }
}
