---
"@blocksai/devtools": patch
---

fix: move TypeScript and build dependencies to dependencies (not devDependencies)

When devtools is installed as a standalone package and run via `blocks-devtools`,
devDependencies aren't installed, causing TypeScript parsing errors. This moves
the necessary dependencies so they're available at runtime.
