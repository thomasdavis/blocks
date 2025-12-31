/**
 * Types for validation run output
 * Matches the CLI types from @blocksai/cli
 */

export interface ValidationIssue {
  type: "error" | "warning" | "info";
  code: string;
  message: string;
  file?: string;
  line?: number;
  suggestion?: string;
}

export interface ValidationContext {
  filesAnalyzed?: string[];           // List of files read
  rulesApplied?: string[];            // Domain rules checked
  philosophy?: string[];              // Philosophy statements used
  summary?: string;                   // AI summary of why passed/failed
}

export interface AIMetadata {
  provider?: string;                  // "openai", "anthropic", etc.
  model?: string;                     // "gpt-4.1-mini", etc.
  prompt?: string;                    // Full prompt sent to AI
  response?: string;                  // Raw AI response
  tokensUsed?: { input: number; output: number };
}

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
