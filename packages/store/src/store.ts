import { eq } from "drizzle-orm";
import type { BlocksConfig, BlockDefinition, DomainEntity, DomainSemantic } from "@blocksai/schema";
import { createSqliteConnection, type SqliteConnection } from "./adapters/sqlite.js";
import { createPostgresConnection, type PostgresConnection } from "./adapters/postgres.js";
import { createLibSqlConnection, type LibSqlConnection } from "./adapters/libsql.js";
import * as schema from "./schema.js";

type ConnectionType = SqliteConnection | PostgresConnection | LibSqlConnection;

export interface BlocksStoreOptions {
  authToken?: string;
}

/**
 * BlocksStore - Database adapter for storing and retrieving Blocks specifications
 *
 * Supports SQLite, PostgreSQL, and libSQL/Turso via Drizzle ORM.
 *
 * URL formats:
 * - SQLite: sqlite:///absolute/path/to/file.db or sqlite://./relative/path.db
 * - PostgreSQL: postgres://user:pass@host:port/dbname or postgresql://...
 * - libSQL/Turso: libsql://host or https://host (requires authToken for remote)
 */
export class BlocksStore {
  private connection: ConnectionType | null = null;
  private dialect: "sqlite" | "postgres" | "libsql" | null = null;
  private initialized = false;

  constructor(
    private readonly databaseUrl: string,
    private readonly options?: BlocksStoreOptions,
  ) {}

  /**
   * Parse database URL and establish connection
   */
  private async connect(): Promise<void> {
    if (this.connection) return;

    let url: URL;
    try {
      url = new URL(this.databaseUrl);
    } catch {
      throw new Error(
        `Invalid database URL: "${this.databaseUrl}". Expected format: sqlite:///path/to/file.db or postgres://user:pass@host/db`
      );
    }

    if (url.protocol === "sqlite:") {
      // Handle sqlite:///path/to/file.db or sqlite://./relative.db
      let dbPath = url.pathname;
      if (url.hostname === ".") {
        dbPath = `.${url.pathname}`;
      } else if (url.hostname) {
        dbPath = url.hostname + url.pathname;
      }
      this.connection = createSqliteConnection(dbPath);
      this.dialect = "sqlite";
    } else if (url.protocol === "postgres:" || url.protocol === "postgresql:") {
      this.connection = await createPostgresConnection(this.databaseUrl);
      this.dialect = "postgres";
    } else if (url.protocol === "libsql:" || url.protocol === "wss:") {
      const authToken = this.options?.authToken || process.env.TURSO_AUTH_TOKEN;
      this.connection = await createLibSqlConnection(this.databaseUrl, authToken);
      this.dialect = "libsql";
    } else {
      throw new Error(
        `Unsupported database protocol: ${url.protocol}. Use sqlite:, postgres:, postgresql:, or libsql:`
      );
    }
  }

  /**
   * Initialize database tables
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.connect();

    if (!this.connection || !this.dialect) {
      throw new Error("Database connection not established");
    }

    if (this.dialect === "sqlite") {
      const { sqlite } = this.connection as SqliteConnection;

      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS blocks (
          name TEXT PRIMARY KEY,
          description TEXT NOT NULL,
          path TEXT,
          inputs TEXT,
          outputs TEXT,
          exclude TEXT,
          skip_validators TEXT,
          validators TEXT,
          test_data TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS entities (
          name TEXT PRIMARY KEY,
          fields TEXT NOT NULL,
          optional TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS semantics (
          name TEXT PRIMARY KEY,
          description TEXT NOT NULL,
          extraction_hint TEXT,
          schema TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS config (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    } else if (this.dialect === "postgres") {
      const { pool } = this.connection as PostgresConnection;

      await pool.query(`
        CREATE TABLE IF NOT EXISTS blocks (
          name TEXT PRIMARY KEY,
          description TEXT NOT NULL,
          path TEXT,
          inputs JSONB,
          outputs JSONB,
          exclude JSONB,
          skip_validators JSONB,
          validators JSONB,
          test_data TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS entities (
          name TEXT PRIMARY KEY,
          fields JSONB NOT NULL,
          optional JSONB,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS semantics (
          name TEXT PRIMARY KEY,
          description TEXT NOT NULL,
          extraction_hint TEXT,
          schema JSONB,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS config (
          key TEXT PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    } else if (this.dialect === "libsql") {
      const { client } = this.connection as LibSqlConnection;

      // libSQL uses batch() for multiple statements
      await client.batch([
        `CREATE TABLE IF NOT EXISTS blocks (
          name TEXT PRIMARY KEY,
          description TEXT NOT NULL,
          path TEXT,
          inputs TEXT,
          outputs TEXT,
          exclude TEXT,
          skip_validators TEXT,
          validators TEXT,
          test_data TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS entities (
          name TEXT PRIMARY KEY,
          fields TEXT NOT NULL,
          optional TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS semantics (
          name TEXT PRIMARY KEY,
          description TEXT NOT NULL,
          extraction_hint TEXT,
          schema TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS config (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )`,
      ], "write");
    }

    this.initialized = true;
  }

  /**
   * Get all blocks as a Record
   */
  async getBlocks(): Promise<Record<string, BlockDefinition>> {
    await this.connect();
    if (!this.connection) throw new Error("Database connection not established");

    const table = this.dialect === "postgres" ? schema.pgBlocks : schema.sqliteBlocks;
    const rows = await (this.connection.db as any).select().from(table);

    const blocks: Record<string, BlockDefinition> = {};
    for (const row of rows) {
      blocks[row.name] = this.rowToBlockDefinition(row);
    }
    return blocks;
  }

  /**
   * Get a single block by name
   */
  async getBlock(name: string): Promise<BlockDefinition | undefined> {
    await this.connect();
    if (!this.connection) throw new Error("Database connection not established");

    const table = this.dialect === "postgres" ? schema.pgBlocks : schema.sqliteBlocks;
    const rows = await (this.connection.db as any).select().from(table).where(eq(table.name, name));

    if (rows.length === 0) return undefined;
    return this.rowToBlockDefinition(rows[0]);
  }

  /**
   * Upsert a block
   */
  async putBlock(name: string, block: BlockDefinition): Promise<void> {
    await this.connect();
    if (!this.connection) throw new Error("Database connection not established");

    const now = new Date().toISOString();
    const table = this.dialect === "postgres" ? schema.pgBlocks : schema.sqliteBlocks;

    const data = this.blockDefinitionToRow(name, block, now);

    // Check if exists
    const existing = await this.getBlock(name);

    if (existing) {
      await (this.connection.db as any).update(table).set(data).where(eq(table.name, name));
    } else {
      await (this.connection.db as any).insert(table).values({ ...data, createdAt: now });
    }
  }

  /**
   * Delete a block
   */
  async deleteBlock(name: string): Promise<void> {
    await this.connect();
    if (!this.connection) throw new Error("Database connection not established");

    const table = this.dialect === "postgres" ? schema.pgBlocks : schema.sqliteBlocks;
    await (this.connection.db as any).delete(table).where(eq(table.name, name));
  }

  /**
   * Get all entities
   */
  async getEntities(): Promise<Record<string, DomainEntity>> {
    await this.connect();
    if (!this.connection) throw new Error("Database connection not established");

    const table = this.dialect === "postgres" ? schema.pgEntities : schema.sqliteEntities;
    const rows = await (this.connection.db as any).select().from(table);

    const entities: Record<string, DomainEntity> = {};
    for (const row of rows) {
      entities[row.name] = this.rowToEntity(row);
    }
    return entities;
  }

  /**
   * Upsert an entity
   */
  async putEntity(name: string, entity: DomainEntity): Promise<void> {
    await this.connect();
    if (!this.connection) throw new Error("Database connection not established");

    const now = new Date().toISOString();
    const table = this.dialect === "postgres" ? schema.pgEntities : schema.sqliteEntities;

    const data = this.entityToRow(name, entity, now);

    // Check if exists
    const existing = await (this.connection.db as any).select().from(table).where(eq(table.name, name));

    if (existing.length > 0) {
      await (this.connection.db as any).update(table).set(data).where(eq(table.name, name));
    } else {
      await (this.connection.db as any).insert(table).values({ ...data, createdAt: now });
    }
  }

  /**
   * Get all semantics
   */
  async getSemantics(): Promise<Record<string, DomainSemantic>> {
    await this.connect();
    if (!this.connection) throw new Error("Database connection not established");

    const table = this.dialect === "postgres" ? schema.pgSemantics : schema.sqliteSemantics;
    const rows = await (this.connection.db as any).select().from(table);

    const semantics: Record<string, DomainSemantic> = {};
    for (const row of rows) {
      semantics[row.name] = this.rowToSemantic(row);
    }
    return semantics;
  }

  /**
   * Upsert a semantic
   */
  async putSemantic(name: string, semantic: DomainSemantic): Promise<void> {
    await this.connect();
    if (!this.connection) throw new Error("Database connection not established");

    const now = new Date().toISOString();
    const table = this.dialect === "postgres" ? schema.pgSemantics : schema.sqliteSemantics;

    const data = this.semanticToRow(name, semantic, now);

    // Check if exists
    const existing = await (this.connection.db as any).select().from(table).where(eq(table.name, name));

    if (existing.length > 0) {
      await (this.connection.db as any).update(table).set(data).where(eq(table.name, name));
    } else {
      await (this.connection.db as any).insert(table).values({ ...data, createdAt: now });
    }
  }

  /**
   * Get a config value
   */
  async getConfig(key: string): Promise<unknown | undefined> {
    await this.connect();
    if (!this.connection) throw new Error("Database connection not established");

    const table = this.dialect === "postgres" ? schema.pgConfig : schema.sqliteConfig;
    const rows = await (this.connection.db as any).select().from(table).where(eq(table.key, key));

    if (rows.length === 0) return undefined;

    if (this.usesTextJson) {
      return this.safeJsonParse(rows[0].value as string, `config.${key}`);
    } else {
      return rows[0].value;
    }
  }

  /**
   * Set a config value
   */
  async putConfig(key: string, value: unknown): Promise<void> {
    await this.connect();
    if (!this.connection) throw new Error("Database connection not established");

    const now = new Date().toISOString();
    const table = this.dialect === "postgres" ? schema.pgConfig : schema.sqliteConfig;

    const data = {
      key,
      value: this.usesTextJson ? JSON.stringify(value) : value,
      updatedAt: now,
    };

    // Check if exists
    const existing = await (this.connection.db as any).select().from(table).where(eq(table.key, key));

    if (existing.length > 0) {
      await (this.connection.db as any).update(table).set(data).where(eq(table.key, key));
    } else {
      await (this.connection.db as any).insert(table).values(data);
    }
  }

  /**
   * Reconstruct a full BlocksConfig from database contents
   */
  async toBlocksConfig(): Promise<BlocksConfig> {
    const [blocks, entities, semantics, name, philosophy, validators, ai, cache] = await Promise.all([
      this.getBlocks(),
      this.getEntities(),
      this.getSemantics(),
      this.getConfig("name"),
      this.getConfig("philosophy"),
      this.getConfig("validators"),
      this.getConfig("ai"),
      this.getConfig("cache"),
    ]);

    const config: BlocksConfig = {
      name: (name as string) || "unknown",
      blocks,
    };

    if (Object.keys(entities).length > 0 || Object.keys(semantics).length > 0) {
      config.domain = {};
      if (Object.keys(entities).length > 0) {
        config.domain.entities = entities;
      }
      if (Object.keys(semantics).length > 0) {
        config.domain.semantics = semantics;
      }
    }

    if (philosophy && Array.isArray(philosophy)) {
      config.philosophy = philosophy as string[];
    }

    if (validators) {
      config.validators = validators as any;
    }

    if (ai) {
      config.ai = ai as any;
    }

    if (cache) {
      config.cache = cache as any;
    }

    return config;
  }

  /**
   * Write a full BlocksConfig to the database
   */
  async fromBlocksConfig(config: BlocksConfig): Promise<void> {
    // Store basic config
    await this.putConfig("name", config.name);

    if (config.philosophy) {
      await this.putConfig("philosophy", config.philosophy);
    }

    if (config.validators) {
      await this.putConfig("validators", config.validators);
    }

    if (config.ai) {
      await this.putConfig("ai", config.ai);
    }

    if (config.cache) {
      await this.putConfig("cache", config.cache);
    }

    // Store blocks
    for (const [name, block] of Object.entries(config.blocks)) {
      await this.putBlock(name, block);
    }

    // Store domain entities
    if (config.domain?.entities) {
      for (const [name, entity] of Object.entries(config.domain.entities)) {
        await this.putEntity(name, entity);
      }
    }

    // Store domain semantics
    if (config.domain?.semantics) {
      for (const [name, semantic] of Object.entries(config.domain.semantics)) {
        await this.putSemantic(name, semantic);
      }
    }
  }

  /**
   * Close database connections
   */
  async close(): Promise<void> {
    if (!this.connection) return;

    if (this.dialect === "sqlite") {
      const { sqlite } = this.connection as SqliteConnection;
      sqlite.close();
    } else if (this.dialect === "postgres") {
      const { pool } = this.connection as PostgresConnection;
      await pool.end();
    } else if (this.dialect === "libsql") {
      const { client } = this.connection as LibSqlConnection;
      client.close();
    }

    this.connection = null;
    this.dialect = null;
    this.initialized = false;
  }

  // ——————————————————————————————————————————
  // Private Helper Methods
  // ——————————————————————————————————————————

  /** Whether the current dialect stores JSON as text (SQLite, libSQL) vs native JSONB (Postgres) */
  private get usesTextJson(): boolean {
    return this.dialect === "sqlite" || this.dialect === "libsql";
  }

  private safeJsonParse(value: string, context: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error(`Failed to parse JSON from database field "${context}": ${value.slice(0, 100)}`);
    }
  }

  private rowToBlockDefinition(row: any): BlockDefinition {
    const block: BlockDefinition = {
      description: row.description,
    };

    if (row.path) block.path = row.path;

    if (row.inputs) {
      block.inputs = this.usesTextJson
        ? this.safeJsonParse(row.inputs, "blocks.inputs") as typeof block.inputs
        : row.inputs;
    }

    if (row.outputs) {
      block.outputs = this.usesTextJson
        ? this.safeJsonParse(row.outputs, "blocks.outputs") as typeof block.outputs
        : row.outputs;
    }

    if (row.exclude) {
      block.exclude = this.usesTextJson
        ? this.safeJsonParse(row.exclude, "blocks.exclude") as typeof block.exclude
        : row.exclude;
    }

    if (row.skipValidators) {
      block.skip_validators = this.usesTextJson
        ? this.safeJsonParse(row.skipValidators, "blocks.skip_validators") as typeof block.skip_validators
        : row.skipValidators;
    }

    if (row.validators) {
      block.validators = this.usesTextJson
        ? this.safeJsonParse(row.validators, "blocks.validators") as typeof block.validators
        : row.validators;
    }

    if (row.testData) {
      block.test_data = row.testData;
    }

    return block;
  }

  private blockDefinitionToRow(name: string, block: BlockDefinition, now: string): any {
    const row: any = {
      name,
      description: block.description,
      path: block.path || null,
      updatedAt: now,
    };

    if (this.usesTextJson) {
      row.inputs = block.inputs ? JSON.stringify(block.inputs) : null;
      row.outputs = block.outputs ? JSON.stringify(block.outputs) : null;
      row.exclude = block.exclude ? JSON.stringify(block.exclude) : null;
      row.skipValidators = block.skip_validators ? JSON.stringify(block.skip_validators) : null;
      row.validators = block.validators ? JSON.stringify(block.validators) : null;
    } else {
      row.inputs = block.inputs || null;
      row.outputs = block.outputs || null;
      row.exclude = block.exclude || null;
      row.skipValidators = block.skip_validators || null;
      row.validators = block.validators || null;
    }

    row.testData = block.test_data || null;

    return row;
  }

  private rowToEntity(row: any): DomainEntity {
    const entity: DomainEntity = {
      fields: this.usesTextJson
        ? this.safeJsonParse(row.fields, "entities.fields") as string[]
        : row.fields,
    };

    if (row.optional) {
      entity.optional = this.usesTextJson
        ? this.safeJsonParse(row.optional, "entities.optional") as string[]
        : row.optional;
    }

    return entity;
  }

  private entityToRow(name: string, entity: DomainEntity, now: string): any {
    const row: any = {
      name,
      updatedAt: now,
    };

    if (this.usesTextJson) {
      row.fields = JSON.stringify(entity.fields);
      row.optional = entity.optional ? JSON.stringify(entity.optional) : null;
    } else {
      row.fields = entity.fields;
      row.optional = entity.optional || null;
    }

    return row;
  }

  private rowToSemantic(row: any): DomainSemantic {
    const semantic: DomainSemantic = {
      description: row.description,
    };

    if (row.extractionHint) {
      semantic.extraction_hint = row.extractionHint;
    }

    if (row.schema) {
      semantic.schema = this.usesTextJson
        ? this.safeJsonParse(row.schema, "semantics.schema")
        : row.schema;
    }

    return semantic;
  }

  private semanticToRow(name: string, semantic: DomainSemantic, now: string): any {
    const row: any = {
      name,
      description: semantic.description,
      extractionHint: semantic.extraction_hint || null,
      updatedAt: now,
    };

    if (this.usesTextJson) {
      row.schema = semantic.schema ? JSON.stringify(semantic.schema) : null;
    } else {
      row.schema = semantic.schema || null;
    }

    return row;
  }
}
