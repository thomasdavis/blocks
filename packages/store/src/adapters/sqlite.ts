import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../schema.js";

export interface SqliteConnection {
  db: BetterSQLite3Database<any>;
  sqlite: Database.Database;
  dialect: "sqlite";
}

export function createSqliteConnection(path: string): SqliteConnection {
  const sqlite = new Database(path);
  sqlite.pragma("journal_mode = WAL");
  const db = drizzle(sqlite, {
    schema: {
      blocks: schema.sqliteBlocks,
      entities: schema.sqliteEntities,
      semantics: schema.sqliteSemantics,
      config: schema.sqliteConfig
    }
  });
  return { db, sqlite, dialect: "sqlite" as const };
}
