---
"@blocksai/schema": minor
"@blocksai/domain": minor
"@blocksai/validators": minor
"@blocksai/cli": minor
---

Implement Blocks Specification v2.0

Breaking changes:
- Remove `root` field - use explicit `path` on each block
- Merge `signals` and `measures` into unified `semantics` concept
- Move `domain_rules` from block level to validator config

New features:
- Add `$schema: "blocks/v2"` version declaration
- Add `exclude` patterns for file exclusion per block
- Add `skip_validators` for opting out of specific validators
- Add `ai.on_failure` configuration (warn/error/skip)
- Add `cache.path` configuration for monorepos
- Add block-level validator overrides with deep merge
- Add entity field optionality with `optional` array
