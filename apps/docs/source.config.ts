import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

// @ts-ignore - Zod portability issue in monorepo on Vercel, but not used at runtime
export const { docs, meta } = defineDocs({
  dir: 'content/docs',
});

export default defineConfig();
