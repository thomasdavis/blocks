---
"@blocksai/store": patch
---

**Launch public Blocks registry**

- Public registry backed by Turso, serving 500 blocks from the official TPMJS tools collection
- Registry API at `/api/registry` returns full BlocksConfig with all blocks, entities, and semantics
- 131 domain entities, 18 semantics, and 28 domain validation rules synced from TPMJS
- Added libSQL/Turso adapter for remote database support
- Sync script to pull official tools from TPMJS monorepo into the registry
