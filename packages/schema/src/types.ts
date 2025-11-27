import { z } from "zod";

/**
 * Core schema definitions for blocks.yml
 * Based on the full PRD specification
 */

// ——————————————————————————————————————————
// Domain Semantics
// ——————————————————————————————————————————

export const DomainFieldSchema = z.object({
  fields: z.array(z.string()),
});

export const DomainEntitySchema = z.record(z.string(), DomainFieldSchema);

export const DomainSignalSchema = z.object({
  description: z.string(),
  extraction_hint: z.string().optional(),
});

export const DomainMeasureSchema = z.object({
  constraints: z.array(z.string()),
});

export const DomainSchema = z.object({
  entities: DomainEntitySchema.optional(),
  signals: z.record(z.string(), DomainSignalSchema).optional(),
  measures: z.record(z.string(), DomainMeasureSchema).optional(),
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
  measures: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
});

export const DomainRuleSchema = z.object({
  id: z.string(),
  description: z.string(),
});

export const BlockDefinitionSchema = z.object({
  description: z.string(),
  path: z.string().optional(), // Custom path to block implementation
  inputs: z.array(BlockInputSchema).optional(),
  outputs: z.array(BlockOutputSchema).optional(),
  domain_rules: z.array(DomainRuleSchema).optional(),
  test_data: z.union([
    z.string(),  // File path to test data
    z.any()      // Inline test data object
  ]).optional(),
});

// ——————————————————————————————————————————
// Validators
// ——————————————————————————————————————————

/**
 * Validator entry - union type supporting both short names and custom validators
 *
 * Examples:
 *   - "schema" (short name)
 *   - "shape.ts" (short name)
 *   - "domain" (short name)
 *   - { name: "my_linter", run: "lint.eslint", config: {...} } (custom)
 */
export const ValidatorEntrySchema = z.union([
  z.string(),  // Short names for built-in validators
  z.object({
    name: z.string(),
    run: z.string(),
    config: z.any().optional(),
  })
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
});

// ——————————————————————————————————————————
// Blocks Collection (supports default domain_rules + block definitions)
// ——————————————————————————————————————————

export const BlocksSchema = z.record(
  z.string(),
  z.union([
    z.array(DomainRuleSchema), // For the domain_rules key
    BlockDefinitionSchema,      // For all other keys (block definitions)
  ])
);

// ——————————————————————————————————————————
// Root Blocks Configuration
// ——————————————————————————————————————————

export const BlocksConfigSchema = z.object({
  name: z.string(),
  root: z.string().optional(),
  philosophy: z.array(z.string()).optional(),
  domain: DomainSchema.optional(),
  blocks: BlocksSchema,
  validators: ValidatorsSchema.optional(),
  ai: AIConfigSchema.optional(),
});

// ——————————————————————————————————————————
// Type Exports
// ——————————————————————————————————————————

export type DomainField = z.infer<typeof DomainFieldSchema>;
export type DomainEntity = z.infer<typeof DomainEntitySchema>;
export type DomainSignal = z.infer<typeof DomainSignalSchema>;
export type DomainMeasure = z.infer<typeof DomainMeasureSchema>;
export type Domain = z.infer<typeof DomainSchema>;

export type BlockInput = z.infer<typeof BlockInputSchema>;
export type BlockOutput = z.infer<typeof BlockOutputSchema>;
export type DomainRule = z.infer<typeof DomainRuleSchema>;
export type BlockDefinition = z.infer<typeof BlockDefinitionSchema>;
export type Blocks = z.infer<typeof BlocksSchema>;

export type ValidatorEntry = z.infer<typeof ValidatorEntrySchema>;
export type Validators = z.infer<typeof ValidatorsSchema>;

export type AIConfig = z.infer<typeof AIConfigSchema>;

export type BlocksConfig = z.infer<typeof BlocksConfigSchema>;
