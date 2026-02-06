# @blocksai/store

Database store for Blocks specifications with SQLite and PostgreSQL support via Drizzle ORM.

## Features

- Store and retrieve BlocksConfig data in SQLite or PostgreSQL
- Support for blocks, domain entities, domain semantics, and config
- Source resolution with file and database sources
- Deep merging of multiple configs
- Type-safe with full TypeScript support

## Installation

```bash
pnpm add @blocksai/store

# For PostgreSQL support (optional)
pnpm add pg
```

## Usage

### Basic Store Operations

```typescript
import { BlocksStore } from "@blocksai/store";

// SQLite
const store = new BlocksStore("sqlite:///path/to/blocks.db");

// PostgreSQL
const store = new BlocksStore("postgres://user:pass@localhost:5432/blocks");

// Initialize tables
await store.initialize();

// Store a block
await store.putBlock("my-block", {
  description: "A sample block",
  path: "./blocks/my-block",
  inputs: [{ name: "input1", type: "string" }],
  outputs: [{ name: "output1", type: "string" }],
});

// Retrieve a block
const block = await store.getBlock("my-block");

// Get all blocks
const allBlocks = await store.getBlocks();

// Store/retrieve config
await store.putConfig("api_key", "secret");
const apiKey = await store.getConfig("api_key");

// Convert database to BlocksConfig
const config = await store.toBlocksConfig();

// Write BlocksConfig to database
await store.fromBlocksConfig(config);

// Close connections
await store.close();
```

### Source Resolution

Resolve configurations from multiple sources (files and databases) with automatic merging:

```typescript
import { resolveConfig } from "@blocksai/store";

const localConfig = {
  name: "my-project",
  blocks: {
    "local-block": {
      description: "Local block",
    },
  },
};

const sources = [
  { type: "file", path: "./shared-blocks.yml" },
  { type: "database", url: "sqlite:///shared.db" },
];

const merged = await resolveConfig(localConfig, sources);
```

## Database Schema

### Blocks Table
- `name` (PK): Block identifier
- `description`: Block description
- `path`: Optional file path
- `inputs`, `outputs`, `exclude`, `skip_validators`, `validators`: Block config (JSON)
- `test_data`: Test data reference
- `created_at`, `updated_at`: Timestamps

### Entities Table
- `name` (PK): Entity identifier
- `fields`: Required fields (JSON array)
- `optional`: Optional fields (JSON array)
- `created_at`, `updated_at`: Timestamps

### Semantics Table
- `name` (PK): Semantic identifier
- `description`: Semantic description
- `extraction_hint`: Optional extraction hint
- `schema`: JSON schema (JSON)
- `created_at`, `updated_at`: Timestamps

### Config Table
- `key` (PK): Config key
- `value`: Config value (JSON)
- `updated_at`: Timestamp

## URL Formats

### SQLite
- `sqlite:///absolute/path/to/file.db` - Absolute path
- `sqlite://./relative/path.db` - Relative path

### PostgreSQL
- `postgres://user:pass@host:port/dbname`
- `postgresql://user:pass@host:port/dbname`

## License

MIT
