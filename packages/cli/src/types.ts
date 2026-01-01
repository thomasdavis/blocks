/**
 * Types for CLI validation run output
 */

import type { ValidationIssue, ValidationContext, AIMetadata } from "@blocksai/validators";

export interface ValidatorRunResult {
  id: string;
  label: string;
  passed: boolean;
  duration: number; // milliseconds
  issues: ValidationIssue[];

  // Rich context for complete visibility
  context?: ValidationContext;

  // AI-specific metadata (for domain validator)
  ai?: AIMetadata;

  // Cache information
  skipped?: boolean;
  skipReason?: string;
}

export interface BlockRunResult {
  blockName: string;
  blockPath: string;
  hasErrors: boolean;
  hasWarnings: boolean;
  validators: ValidatorRunResult[];

  // Cache information
  cache?: {
    decision: string; // Summary of cache decision
    skippedValidators: number;
    revalidationReason?: string;
  };
}

export interface ValidationRunOutput {
  version: "1.0";
  id: string; // unique run ID (timestamp-based)
  timestamp: string; // ISO 8601
  configPath: string;
  projectName: string;
  duration: number; // total milliseconds
  summary: {
    totalBlocks: number;
    passed: number;
    failed: number;
    warnings: number;
    // Cache statistics
    cached?: {
      validatorsSkipped: number;
      validatorsRun: number;
      timeSavedMs: number; // Estimated time saved
    };
  };
  blocks: BlockRunResult[];
}

export interface RunCommandOptions {
  all?: boolean;
  config: string;
  json?: boolean;
  output?: string;
  concurrency?: number;
  // Cache control options
  force?: boolean; // --force flag: skip cache, run all validators
  cache?: boolean; // --no-cache sets this to false (Commander.js convention)
}
