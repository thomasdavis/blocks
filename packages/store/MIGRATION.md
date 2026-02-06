# Migration Guide

This guide helps you migrate from YAML-based Blocks configuration to database storage.

## Prerequisites

```bash
npm install @blocksai/store

# For PostgreSQL support
npm install pg
```

## Migrating from blocks.yml to Database

### Step 1: Create a Migration Script

Create a file `migrate-to-db.ts`:

```typescript
import { readFileSync } from "fs";
import { parse } from "yaml";
import { BlocksStore } from "@blocksai/store";
import type { BlocksConfig } from "@blocksai/schema";

async function migrate() {
  // Read existing blocks.yml
  const yamlContent = readFileSync("./blocks.yml", "utf-8");
  const config: BlocksConfig = parse(yamlContent);

  // Create database store
  const store = new BlocksStore("sqlite://./blocks.db");

  // Initialize tables
  await store.initialize();

  // Write config to database
  await store.fromBlocksConfig(config);

  console.log("Migration complete!");
  console.log(`- Migrated ${Object.keys(config.blocks).length} blocks`);
  console.log(`- Migrated ${Object.keys(config.domain?.entities || {}).length} entities`);
  console.log(`- Migrated ${Object.keys(config.domain?.semantics || {}).length} semantics`);

  // Verify migration
  const restored = await store.toBlocksConfig();
  console.log("\nRestored config:", JSON.stringify(restored, null, 2));

  await store.close();
}

migrate().catch(console.error);
```

### Step 2: Run the Migration

```bash
tsx migrate-to-db.ts
```

### Step 3: Update Your Application

Before:
```typescript
import { readFileSync } from "fs";
import { parse } from "yaml";

const config = parse(readFileSync("./blocks.yml", "utf-8"));
```

After:
```typescript
import { BlocksStore } from "@blocksai/store";

const store = new BlocksStore("sqlite://./blocks.db");
await store.initialize();
const config = await store.toBlocksConfig();
```

## Using Multiple Sources

You can combine file-based and database-based configurations:

```typescript
import { resolveConfig } from "@blocksai/store";
import { readFileSync } from "fs";
import { parse } from "yaml";

// Local config from file
const localConfig = parse(readFileSync("./blocks.yml", "utf-8"));

// Resolve with remote sources
const sources = [
  { type: "database", url: "postgres://user:pass@host/db" },
  { type: "file", path: "./shared-blocks.yml" },
];

const merged = await resolveConfig(localConfig, sources);
```

## PostgreSQL Migration

For PostgreSQL:

```typescript
const store = new BlocksStore(
  "postgres://user:password@localhost:5432/blocks"
);
await store.initialize();
await store.fromBlocksConfig(config);
```

## Best Practices

1. **Backup First**: Always backup your blocks.yml before migrating
2. **Verify Migration**: Check the restored config matches the original
3. **Incremental Migration**: Migrate in stages for large configs
4. **Keep YAML as Backup**: Maintain blocks.yml as a backup/reference
5. **Version Control**: Track database schema changes

## Rollback

To rollback to YAML:

```typescript
import { writeFileSync } from "fs";
import { stringify } from "yaml";
import { BlocksStore } from "@blocksai/store";

const store = new BlocksStore("sqlite://./blocks.db");
await store.initialize();
const config = await store.toBlocksConfig();

// Write back to YAML
writeFileSync("./blocks.yml", stringify(config));
await store.close();
```

## Troubleshooting

### PostgreSQL Connection Issues

If you get "Cannot find module 'pg'":
```bash
npm install pg
```

### SQLite Locked Database

If you get "database is locked":
- Ensure no other process is using the database
- Check file permissions
- Try using WAL mode (enabled by default)

### Schema Mismatch

If data looks wrong after migration:
- Check field mappings (snake_case vs camelCase)
- Verify JSON serialization for complex fields
- Compare original and restored configs
