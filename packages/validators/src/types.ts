/**
 * Common types for validators
 */

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

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];

  // Rich context for complete visibility
  context?: ValidationContext;

  // AI-specific metadata (for domain validator)
  ai?: AIMetadata;
}

export interface ValidationIssue {
  type: "error" | "warning" | "info";
  code: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export interface ValidatorContext {
  blockName: string;
  blockPath: string;
  config: any;
}

export interface Validator {
  id: string;
  validate(context: ValidatorContext): Promise<ValidationResult>;
}
