import { parse as parseYaml } from "yaml";
import { BlocksConfigSchema, type BlocksConfig } from "./types.js";

/**
 * Parse and validate a blocks.yml configuration file
 */
export function parseBlocksConfig(yamlContent: string): BlocksConfig {
  const parsed = parseYaml(yamlContent);
  return BlocksConfigSchema.parse(parsed);
}

/**
 * Validate a blocks configuration object
 */
export function validateBlocksConfig(config: unknown): BlocksConfig {
  return BlocksConfigSchema.parse(config);
}

/**
 * Check if a configuration is valid without throwing
 */
export function isValidBlocksConfig(config: unknown): config is BlocksConfig {
  const result = BlocksConfigSchema.safeParse(config);
  return result.success;
}
