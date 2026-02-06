import * as schema from "../schema.js";

export interface LibSqlConnection {
  db: any;
  client: any;
  dialect: "libsql";
}

export async function createLibSqlConnection(
  url: string,
  authToken?: string,
): Promise<LibSqlConnection> {
  try {
    const { createClient } = await import("@libsql/client");
    const { drizzle } = await import("drizzle-orm/libsql");

    const client = createClient({
      url,
      authToken,
    });

    const db = drizzle(client, {
      schema: {
        blocks: schema.sqliteBlocks,
        entities: schema.sqliteEntities,
        semantics: schema.sqliteSemantics,
        config: schema.sqliteConfig,
      },
    });

    return { db, client, dialect: "libsql" as const };
  } catch (error: any) {
    if (
      error?.code === "ERR_MODULE_NOT_FOUND" ||
      error?.code === "MODULE_NOT_FOUND" ||
      (error instanceof Error && error.message.includes("Cannot find module"))
    ) {
      throw new Error(
        "libSQL/Turso support requires the '@libsql/client' package. Install it with: pnpm add @libsql/client",
      );
    }
    throw error;
  }
}
