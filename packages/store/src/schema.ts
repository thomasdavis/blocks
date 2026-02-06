import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, jsonb } from "drizzle-orm/pg-core";

// ——————————————————————————————————————————
// SQLite Tables
// ——————————————————————————————————————————

export const sqliteBlocks = sqliteTable("blocks", {
  name: text("name").primaryKey(),
  description: text("description").notNull(),
  path: text("path"),
  inputs: text("inputs"),      // JSON stringified
  outputs: text("outputs"),    // JSON stringified
  exclude: text("exclude"),    // JSON stringified
  skipValidators: text("skip_validators"), // JSON stringified
  validators: text("validators"), // JSON stringified
  testData: text("test_data"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const sqliteEntities = sqliteTable("entities", {
  name: text("name").primaryKey(),
  fields: text("fields").notNull(), // JSON stringified array
  optional: text("optional"),       // JSON stringified array
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const sqliteSemantics = sqliteTable("semantics", {
  name: text("name").primaryKey(),
  description: text("description").notNull(),
  extractionHint: text("extraction_hint"),
  schema: text("schema"), // JSON stringified
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const sqliteConfig = sqliteTable("config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(), // JSON stringified
  updatedAt: text("updated_at").notNull(),
});

// ——————————————————————————————————————————
// PostgreSQL Tables
// ——————————————————————————————————————————

export const pgBlocks = pgTable("blocks", {
  name: pgText("name").primaryKey(),
  description: pgText("description").notNull(),
  path: pgText("path"),
  inputs: jsonb("inputs"),
  outputs: jsonb("outputs"),
  exclude: jsonb("exclude"),
  skipValidators: jsonb("skip_validators"),
  validators: jsonb("validators"),
  testData: pgText("test_data"),
  createdAt: pgText("created_at").notNull(),
  updatedAt: pgText("updated_at").notNull(),
});

export const pgEntities = pgTable("entities", {
  name: pgText("name").primaryKey(),
  fields: jsonb("fields").notNull(),
  optional: jsonb("optional"),
  createdAt: pgText("created_at").notNull(),
  updatedAt: pgText("updated_at").notNull(),
});

export const pgSemantics = pgTable("semantics", {
  name: pgText("name").primaryKey(),
  description: pgText("description").notNull(),
  extractionHint: pgText("extraction_hint"),
  schema: jsonb("schema"),
  createdAt: pgText("created_at").notNull(),
  updatedAt: pgText("updated_at").notNull(),
});

export const pgConfig = pgTable("config", {
  key: pgText("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: pgText("updated_at").notNull(),
});
