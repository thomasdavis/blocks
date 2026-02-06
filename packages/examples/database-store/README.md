# Database Store Example

Demonstrates using `@blocksai/store` to share domain specifications across projects via a SQLite database.

## Scenario

A team maintains shared API standards (entities, semantics, philosophy) in a database. Individual projects pull these standards via `sources:` in their `blocks.yml`, then extend them with project-specific config. The validator merges everything together so each project is checked against both shared and local rules.

This example uses **mixed sources** — a YAML file (`shared-blocks.yml`) and a SQLite database (`shared-api-standards.db`) — to show how multiple sources merge together.

## Quick Start

```bash
# Install dependencies (from repo root)
pnpm install

# Seed the shared database
pnpm seed

# Validate all blocks (merges DB + file + local config)
pnpm validate:all
```

## How It Works

### 1. Seed the Database

The `seed.ts` script uses the `BlocksStore` API directly to populate a SQLite database:

```bash
npx tsx seed.ts
```

This creates `shared-api-standards.db` containing:
- **3 entities** — `api_request`, `api_response`, `error_response`
- **2 semantics** — `rest_compliance`, `error_handling`
- **3 philosophy statements** — team-wide API conventions
- **1 shared block** — `endpoint.health` (all services must implement)

### 2. Local Config Extends Shared Standards

The local `blocks.yml` declares sources and adds project-specific config:

```yaml
sources:
  - type: file
    path: "./shared-blocks.yml"
  - type: database
    url: "sqlite://./shared-api-standards.db"

# Local additions that merge with shared standards
domain:
  entities:
    pagination:
      fields: [page, per_page, total, total_pages]
```

### 3. Validation Merges Everything

When you run `blocks run --all`, the CLI:
1. Loads `blocks.yml`
2. Resolves `shared-blocks.yml` (file source)
3. Resolves `shared-api-standards.db` (database source)
4. Merges all configs — local config wins on conflicts
5. Validates blocks against the merged domain

### Merge Order

Sources are applied in order, then local config last:

```
shared-blocks.yml  →  shared-api-standards.db  →  blocks.yml (local wins)
```

- **Entities/semantics**: merged by key, local overrides on conflict
- **Philosophy**: concatenated and deduplicated
- **Validators/AI config**: local wins if present

## CLI Alternative

Instead of the `seed.ts` script, you can use the CLI to push/pull config:

```bash
# Initialize an empty database
blocks store init sqlite://./shared-api-standards.db

# Push a YAML config into the database
blocks store push sqlite://./shared-api-standards.db --config some-config.yml

# Pull database contents as JSON
blocks store pull sqlite://./shared-api-standards.db --json
```

## When to Use Database vs YAML

| Approach | Best For |
|----------|----------|
| **Database** | Large teams, many projects sharing standards, programmatic updates |
| **YAML file** | Small teams, version-controlled shared config, simple setups |
| **Both** | Layered standards — org-wide DB + team-specific YAML files |

## PostgreSQL

This example uses SQLite for zero-config setup. To use PostgreSQL instead, change the database URL:

```yaml
sources:
  - type: database
    url: "postgres://user:pass@localhost:5432/api_standards"
```

The `BlocksStore` API is identical for both backends.

## Project Structure

```
database-store/
├── blocks.yml                  # Local config with sources
├── shared-blocks.yml           # File source (shared YAML)
├── seed.ts                     # Programmatic DB seeding
├── blocks/
│   └── endpoint-get-users/
│       ├── block.ts            # Endpoint handler implementation
│       └── index.ts            # Exports
└── shared-api-standards.db     # Created by seed.ts (gitignored)
```
