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
  test_data: z.string().optional(), // Path to test data file for validation
  test_samples: z.array(z.any()).optional(), // Inline test data samples
});

// ——————————————————————————————————————————
// Validators
// ——————————————————————————————————————————

export const ValidatorSchema = z.object({
  id: z.string(),
  run: z.union([z.string(), z.array(z.string())]),
  weight: z.number().optional(),
});

export const ValidatorsSchema = z.object({
  schema: z.array(ValidatorSchema).optional(),
  shape: z.array(ValidatorSchema).optional(),
  lint: z.array(ValidatorSchema).optional(),
  domain: z.array(ValidatorSchema).optional(),
  chain: z.array(ValidatorSchema).optional(),
  shadow: z.array(ValidatorSchema).optional(),
  scoring: z.array(ValidatorSchema).optional(),
});

// ——————————————————————————————————————————
// Pipeline
// ——————————————————————————————————————————

export const PipelineStepSchema = z.object({
  id: z.string(),
  run: z.string().optional(),
  run_chain: z.array(z.string()).optional(),
});

export const PipelineSchema = z.object({
  name: z.string(),
  steps: z.array(PipelineStepSchema),
});

// ——————————————————————————————————————————
// Agent Configuration
// ——————————————————————————————————————————

export const AgentCliSchema = z.object({
  single: z.string(),
  all: z.string(),
});

export const AgentSchema = z.object({
  mode: z.string(),
  rules: z.array(z.string()),
  cli: AgentCliSchema,
});

// ——————————————————————————————————————————
// Targets
// ——————————————————————————————————————————

export const TargetsSchema = z.object({
  kind: z.string(),
  discover: z.object({
    root: z.string(),
  }),
});

// ——————————————————————————————————————————
// Project & Philosophy
// ——————————————————————————————————————————

export const ProjectSchema = z.object({
  name: z.string(),
  domain: z.string(),
});

// ——————————————————————————————————————————
// Root Blocks Configuration
// ——————————————————————————————————————————

export const BlocksConfigSchema = z.object({
  project: ProjectSchema,
  philosophy: z.array(z.string()).optional(),
  domain: DomainSchema.optional(),
  blocks: z.record(z.string(), BlockDefinitionSchema),
  validators: ValidatorsSchema.optional(),
  pipeline: PipelineSchema.optional(),
  agent: AgentSchema.optional(),
  targets: TargetsSchema.optional(),
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

export type Validator = z.infer<typeof ValidatorSchema>;
export type Validators = z.infer<typeof ValidatorsSchema>;

export type PipelineStep = z.infer<typeof PipelineStepSchema>;
export type Pipeline = z.infer<typeof PipelineSchema>;

export type AgentCli = z.infer<typeof AgentCliSchema>;
export type Agent = z.infer<typeof AgentSchema>;

export type Targets = z.infer<typeof TargetsSchema>;

export type Project = z.infer<typeof ProjectSchema>;

export type BlocksConfig = z.infer<typeof BlocksConfigSchema>;
