import { parse as parseYaml } from "yaml";
import { readFileSync, existsSync } from "fs";
import { BlocksStore } from "./store.js";
import type { BlocksConfig, SourceEntry } from "@blocksai/schema";

export type { SourceEntry };

/**
 * Resolve all sources and merge them with the local config.
 * Sources are applied in order, then local config is merged last (local wins).
 */
export async function resolveConfig(
  localConfig: BlocksConfig,
  sources: SourceEntry[],
): Promise<BlocksConfig> {
  let merged: BlocksConfig = {
    name: localConfig.name,
    blocks: {},
  };

  // Apply sources in order
  for (const source of sources) {
    if (source.type === "file") {
      if (!("path" in source) || !source.path) {
        throw new Error("File source missing 'path' field");
      }
      if (!existsSync(source.path)) {
        throw new Error(`Source file not found: ${source.path}`);
      }
      const content = readFileSync(source.path, "utf-8");
      const parsed = parseYaml(content) as BlocksConfig;
      merged = deepMergeConfig(merged, parsed);
    } else if (source.type === "database") {
      if (!("url" in source) || !source.url) {
        throw new Error("Database source missing 'url' field");
      }
      const store = new BlocksStore(source.url);
      try {
        await store.initialize();
        const dbConfig = await store.toBlocksConfig();
        merged = deepMergeConfig(merged, dbConfig);
      } finally {
        await store.close();
      }
    }
  }

  // Local config wins (merge last)
  merged = deepMergeConfig(merged, localConfig);

  return merged;
}

/**
 * Deep merge two BlocksConfig objects.
 * - blocks: merged by key (target wins on conflict)
 * - domain.entities: merged by key (target wins on conflict)
 * - domain.semantics: merged by key (target wins on conflict)
 * - philosophy: concatenated and deduped
 * - validators: target wins if present, otherwise base
 * - ai: target wins if present, otherwise base
 * - cache: target wins if present, otherwise base
 * - name: target wins
 */
function deepMergeConfig(base: BlocksConfig, override: BlocksConfig): BlocksConfig {
  const result: BlocksConfig = {
    name: override.name || base.name,
    blocks: { ...base.blocks, ...override.blocks },
  };

  // Merge domain entities and semantics
  if (base.domain || override.domain) {
    result.domain = {};

    if (base.domain?.entities || override.domain?.entities) {
      result.domain.entities = {
        ...base.domain?.entities,
        ...override.domain?.entities,
      };
    }

    if (base.domain?.semantics || override.domain?.semantics) {
      result.domain.semantics = {
        ...base.domain?.semantics,
        ...override.domain?.semantics,
      };
    }
  }

  // Concatenate and dedupe philosophy
  if (base.philosophy || override.philosophy) {
    const combined = [
      ...(base.philosophy || []),
      ...(override.philosophy || []),
    ];
    result.philosophy = Array.from(new Set(combined));
  }

  // For validators, ai, cache: override wins if present
  if (override.validators !== undefined) {
    result.validators = override.validators;
  } else if (base.validators !== undefined) {
    result.validators = base.validators;
  }

  if (override.ai !== undefined) {
    result.ai = override.ai;
  } else if (base.ai !== undefined) {
    result.ai = base.ai;
  }

  if (override.cache !== undefined) {
    result.cache = override.cache;
  } else if (base.cache !== undefined) {
    result.cache = base.cache;
  }

  return result;
}
