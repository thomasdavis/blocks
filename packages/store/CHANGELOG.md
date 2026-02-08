# @blocksai/store

## 0.2.0

### Minor Changes

- 79c7902: **Add database storage and public registry**
  - New `@blocksai/store` package for persistent database-backed storage of Blocks specifications
  - Supports SQLite, PostgreSQL, and libSQL/Turso via Drizzle ORM
  - New `blocks store` CLI commands: `init`, `push`, and `pull` for managing remote block storage
  - Added `sources` configuration to schema for pulling block specs from databases or files
  - Source resolution with deep merging (local config wins on conflicts)

### Patch Changes

- 79c7902: **Add user authentication and block submissions**
  - Magic link authentication via better-auth and Resend email
  - Registry browse page at `/registry` with search and filtering
  - Block submission form at `/registry/submit` for authenticated users
  - User-submitted blocks merged into registry API responses

- 79c7902: **Launch public Blocks registry**
  - Public registry backed by Turso, serving 500 blocks from the official TPMJS tools collection
  - Registry API at `/api/registry` returns full BlocksConfig with all blocks, entities, and semantics
  - 131 domain entities, 18 semantics, and 28 domain validation rules synced from TPMJS
  - Added libSQL/Turso adapter for remote database support
  - Sync script to pull official tools from TPMJS monorepo into the registry

- Updated dependencies [79c7902]
  - @blocksai/schema@1.2.0
