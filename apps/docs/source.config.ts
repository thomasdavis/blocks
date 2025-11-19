import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import type { InferMetaType, InferPageType } from 'fumadocs-core/source';

const result = defineDocs({
  dir: 'content/docs',
});

export const docs: InferPageType<typeof result.docs> = result.docs;
export const meta: InferMetaType<typeof result.meta> = result.meta;

export default defineConfig();
