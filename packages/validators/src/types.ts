/**
 * Common types for validators
 */

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
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
