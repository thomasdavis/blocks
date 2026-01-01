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
}

export interface BlockRunResult {
  blockName: string;
  blockPath: string;
  hasErrors: boolean;
  hasWarnings: boolean;
  validators: ValidatorRunResult[];
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
  };
  blocks: BlockRunResult[];
}

export interface RunCommandOptions {
  all?: boolean;
  config: string;
  json?: boolean;
  output?: string;
  concurrency?: number;
}
