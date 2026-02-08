---
"@blocksai/store": minor
"@blocksai/cli": minor
"@blocksai/schema": minor
---

**Add database storage and public registry**

- New `@blocksai/store` package for persistent database-backed storage of Blocks specifications
- Supports SQLite, PostgreSQL, and libSQL/Turso via Drizzle ORM
- New `blocks store` CLI commands: `init`, `push`, and `pull` for managing remote block storage
- Added `sources` configuration to schema for pulling block specs from databases or files
- Source resolution with deep merging (local config wins on conflicts)
