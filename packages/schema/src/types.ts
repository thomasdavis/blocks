import { z } from "zod";

/**
 * Core schema definitions for blocks.yml v2.0
 * Based on the Blocks Specification v2.0
 */

// ——————————————————————————————————————————
// Domain Semantics
// ——————————————————————————————————————————

export const DomainEntitySchema = z.object({
  fields: z.array(z.string()),
  optional: z.array(z.string()).optional(),
});

export const DomainSemanticSchema = z.object({
  description: z.string(),
  extraction_hint: z.string().optional(),
  schema: z.any().optional(), // JSON Schema for runtime validation
});

export const DomainSchema = z.object({
  entities: z.record(z.string(), DomainEntitySchema).optional(),
  semantics: z.record(z.string(), DomainSemanticSchema).optional(),
});

// ——————————————————————————————————————————
// Block Definitions
// ——————————————————————————————————————————

export const BlockInputSchema = z.object({
  name: z.string(),
  type: z.string(),
  optional: z.boolean().optional(),
});

export const BlockOutputSchema = z.object({
  name: z.string(),
  type: z.string(),
  semantics: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
});

export const DomainRuleSchema = z.object({
  id: z.string(),
  description: z.string(),
});

export const BlockDefinitionSchema = z.object({
  description: z.string(),
  path: z.string().optional(),
  inputs: z.array(BlockInputSchema).optional(),
  outputs: z.array(BlockOutputSchema).optional(),
  exclude: z.array(z.string()).optional(),
  skip_validators: z.array(z.string()).optional(),
  validators: z.record(z.string(), z.any()).optional(),
  test_data: z
    .union([
      z.string(), // File path to test data
      z.any(), // Inline test data object
    ])
    .optional(),
});

// ——————————————————————————————————————————
// Validators
// ——————————————————————————————————————————

/**
 * Validator configuration - allows domain rules and custom config
 */
export const ValidatorConfigSchema = z
  .object({
    rules: z.array(DomainRuleSchema).optional(),
  })
  .passthrough(); // Allow custom config fields

/**
 * Validator entry - union type supporting both short names and custom validators
 *
 * Examples:
 *   - "schema" (short name)
 *   - "shape" (short name)
 *   - "domain" (short name)
 *   - { name: "domain", config: { rules: [...] } } (with config)
 *   - { name: "output", run: "validators/output", config: {...} } (custom)
 */
export const ValidatorEntrySchema = z.union([
  z.string(), // Short names for built-in validators
  z.object({
    name: z.string(),
    run: z.string().optional(),
    config: ValidatorConfigSchema.optional(),
  }),
]);

export const ValidatorsSchema = z.array(ValidatorEntrySchema).optional();

// ——————————————————————————————————————————
// AI Configuration
// ——————————————————————————————————————————

export const AIConfigSchema = z.object({
  /**
   * AI provider to use (default: "openai")
   * Supported: openai, anthropic, google
   */
  provider: z.enum(["openai", "anthropic", "google"]).optional(),

  /**
   * Model name to use (default depends on provider)
   * OpenAI: "gpt-4o-mini", "gpt-4o", "gpt-4-turbo"
   * Anthropic: "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"
   * Google: "gemini-1.5-flash", "gemini-1.5-pro"
   */
  model: z.string().optional(),

  /**
   * Behavior on AI failure
   * - "warn": Return valid with warning (default)
   * - "error": Fail validation on AI error
   * - "skip": Skip AI validation entirely
   */
  on_failure: z.enum(["warn", "error", "skip"]).optional(),
});

// ——————————————————————————————————————————
// Sources Configuration
// ——————————————————————————————————————————

/**
 * Source entry for pulling block specs from external sources.
 *
 * Supported source types:
 *   - "database": Pull from SQLite or PostgreSQL via connection URL
 *   - "file": Merge another YAML file
 *
 * Examples:
 *   - { type: "database", url: "sqlite:///path/to/blocks.db" }
 *   - { type: "database", url: "postgres://user:pass@host/db", sync: "pull" }
 *   - { type: "file", path: "./shared-blocks.yml" }
 */
export const SourceEntrySchema = z.union([
  z.object({
    type: z.literal("database"),
    url: z.string(),
    sync: z.enum(["pull", "push", "sync"]).optional(), // default: "pull"
  }),
  z.object({
    type: z.literal("file"),
    path: z.string(),
  }),
]);

export const SourcesSchema = z.array(SourceEntrySchema).optional();

// ——————————————————————————————————————————
// Cache Configuration
// ——————————————————————————————————————————

export const CacheConfigSchema = z.object({
  path: z.string().optional(),
});

// ——————————————————————————————————————————
// Blocks Collection
// ——————————————————————————————————————————

export const BlocksSchema = z.record(z.string(), BlockDefinitionSchema);

// ——————————————————————————————————————————
// Root Blocks Configuration
// ——————————————————————————————————————————

export const BlocksConfigSchema = z.object({
  $schema: z.string().optional(),
  name: z.string(),
  philosophy: z.array(z.string()).optional(),
  sources: SourcesSchema.optional(),
  domain: DomainSchema.optional(),
  blocks: BlocksSchema,
  validators: ValidatorsSchema.optional(),
  ai: AIConfigSchema.optional(),
  cache: CacheConfigSchema.optional(),
});

// ——————————————————————————————————————————
// Type Exports
// ——————————————————————————————————————————

export type DomainEntity = z.infer<typeof DomainEntitySchema>;
export type DomainSemantic = z.infer<typeof DomainSemanticSchema>;
export type Domain = z.infer<typeof DomainSchema>;

export type BlockInput = z.infer<typeof BlockInputSchema>;
export type BlockOutput = z.infer<typeof BlockOutputSchema>;
export type DomainRule = z.infer<typeof DomainRuleSchema>;
export type BlockDefinition = z.infer<typeof BlockDefinitionSchema>;
export type Blocks = z.infer<typeof BlocksSchema>;

export type ValidatorConfig = z.infer<typeof ValidatorConfigSchema>;
export type ValidatorEntry = z.infer<typeof ValidatorEntrySchema>;
export type Validators = z.infer<typeof ValidatorsSchema>;

export type AIConfig = z.infer<typeof AIConfigSchema>;
export type CacheConfig = z.infer<typeof CacheConfigSchema>;
export type SourceEntry = z.infer<typeof SourceEntrySchema>;
export type Sources = z.infer<typeof SourcesSchema>;

export type BlocksConfig = z.infer<typeof BlocksConfigSchema>;
