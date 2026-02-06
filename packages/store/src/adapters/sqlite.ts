import * as schema from "../schema.js";

export interface SqliteConnection {
  db: any;
  sqlite: any;
  dialect: "sqlite";
}

export async function createSqliteConnection(path: string): Promise<SqliteConnection> {
  try {
    const Database = (await import("better-sqlite3")).default;
    const { drizzle } = await import("drizzle-orm/better-sqlite3");

    const sqlite = new Database(path);
    sqlite.pragma("journal_mode = WAL");
    const db = drizzle(sqlite, {
      schema: {
        blocks: schema.sqliteBlocks,
        entities: schema.sqliteEntities,
        semantics: schema.sqliteSemantics,
        config: schema.sqliteConfig,
      },
    });
    return { db, sqlite, dialect: "sqlite" as const };
  } catch (error: any) {
    if (
      error?.code === "ERR_MODULE_NOT_FOUND" ||
      error?.code === "MODULE_NOT_FOUND" ||
      (error instanceof Error && error.message.includes("Cannot find module"))
    ) {
      throw new Error(
        "SQLite support requires the 'better-sqlite3' package. Install it with: pnpm add better-sqlite3",
      );
    }
    throw error;
  }
}
