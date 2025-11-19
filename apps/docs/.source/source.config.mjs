// source.config.ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
var result = defineDocs({
  dir: "content/docs"
});
var docs = result.docs;
var meta = result.meta;
var source_config_default = defineConfig();
export {
  source_config_default as default,
  docs,
  meta
};
