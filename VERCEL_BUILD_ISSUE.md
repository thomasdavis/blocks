# Vercel Build Issue: TypeScript Inference in Turborepo Monorepo

## Context

I'm building a documentation site using the latest versions of:
- **Fumadocs v16.0.14** (popular documentation framework)
- **Next.js 16.0.3** (Turbopack)
- **TypeScript 5.9.3**
- **Turborepo** monorepo structure

## Problem

The build **works perfectly locally** but **fails on Vercel** with this TypeScript error:

```
./source.config.ts:4:7
Type error: The inferred type of 'result' cannot be named without a reference to '.pnpm/zod@4.1.12/node_modules/zod'. This is likely not portable. A type annotation is necessary.

  2 | import type { InferMetaType, InferPageType } from 'fumadocs-core/source';
  3 |
> 4 | const result = defineDocs({
    |       ^
  5 |   dir: 'content/docs',
  6 | });
  7 |
```

## Project Structure

```
blocks/                          # Turborepo monorepo root
├── apps/
│   └── docs/                    # Next.js app with Fumadocs
│       ├── source.config.ts     # ❌ Failing file
│       ├── lib/source.ts
│       └── package.json
├── packages/
│   ├── cli/
│   ├── schema/
│   └── validators/
├── pnpm-workspace.yaml
└── turbo.json
```

## Current Code

### `apps/docs/source.config.ts` (Failing)

```typescript
import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import type { InferMetaType, InferPageType } from 'fumadocs-core/source';

const result = defineDocs({  // ❌ Error here
  dir: 'content/docs',
});

export const docs: InferPageType<typeof result.docs> = result.docs;
export const meta: InferMetaType<typeof result.meta> = result.meta;

export default defineConfig();
```

### `apps/docs/lib/source.ts`

```typescript
import { docs, meta } from '@/source.config';
import { loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';

export const source = loader({
  baseUrl: '/docs',
  source: docs,
  icon(icon) {
    if (icon && icon in icons)
      return createElement(icons[icon as keyof typeof icons]);
  },
});
```

## What I've Tried

1. ✅ **Direct destructuring** - This gave a different portability error:
   ```typescript
   export const { docs, meta } = defineDocs({ dir: 'content/docs' });
   ```

2. ✅ **Type annotations** - Current approach, still fails on Vercel:
   ```typescript
   const result = defineDocs({ dir: 'content/docs' });
   export const docs: InferPageType<typeof result.docs> = result.docs;
   ```

3. ✅ **`@ts-expect-error`** - Doesn't solve portability issue

4. ✅ **Checked pnpm workspace** - Properly configured

## Key Details

- **Local build**: ✅ Works (`pnpm build` succeeds)
- **Vercel build**: ❌ Fails with Zod portability error
- **pnpm version**: 9.15.0
- **Node version**: Latest on Vercel
- **Monorepo**: Turborepo with pnpm workspaces

The issue appears related to:
1. Zod's type inference in monorepo context
2. pnpm's module resolution (`.pnpm/zod@4.1.12/node_modules/zod`)
3. TypeScript's portability checks in CI vs local

## Question

**How do I properly type the `defineDocs` result to satisfy TypeScript's portability requirements in a Turborepo monorepo that builds on Vercel?**

Fumadocs is a widely-used documentation framework (by the Vercel community), so this should be a solved problem, but I can't find the right pattern.

## Additional Context

### `apps/docs/package.json`

```json
{
  "name": "@blocks/docs",
  "type": "module",
  "dependencies": {
    "fumadocs-core": "16.0.14",
    "fumadocs-mdx": "14.0.2",
    "fumadocs-ui": "16.0.14",
    "next": "16.0.3",
    "react": "19.2.0"
  },
  "devDependencies": {
    "@blocks/tsconfig": "workspace:*",
    "typescript": "5.9.3"
  }
}
```

### `apps/docs/tsconfig.json`

```json
{
  "extends": "@blocks/tsconfig/nextjs.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Root `pnpm-workspace.yaml`

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

## Expected Solution

I need a way to:
1. Export `docs` and `meta` from `source.config.ts`
2. Without TypeScript portability errors
3. That works in both local and Vercel CI builds
4. Following Fumadocs best practices

What's the correct pattern for this?
