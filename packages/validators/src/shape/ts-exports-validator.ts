import type { Validator, ValidatorContext, ValidationResult, ValidationIssue } from "../types.js";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

/**
 * TypeScript shape validator - validates file structure and exports
 *
 * This validator is flexible about file naming - it only checks that:
 * 1. At least one .ts file exists in the block folder
 * 2. At least one file has exports
 *
 * blocks.yml is the ONLY required convention - file naming is up to the developer.
 */
export class TsExportsShapeValidator implements Validator {
  id = "shape.exports.ts";

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    // Check if blockPath is a directory
    let isDirectory = false;
    try {
      isDirectory = statSync(context.blockPath).isDirectory();
    } catch {
      issues.push({
        type: "error",
        code: "INVALID_PATH",
        message: `Block path does not exist: ${context.blockPath}`,
        suggestion: `Create the block folder at ${context.blockPath}`,
      });
      return { valid: false, issues };
    }

    if (!isDirectory) {
      // Single file block - just check it exists and has exports
      const content = readFileSync(context.blockPath, "utf-8");
      if (!content.includes("export")) {
        issues.push({
          type: "warning",
          code: "NO_EXPORTS",
          message: "Block file should export functions or types",
        });
      }
      return { valid: true, issues };
    }

    // Directory block - check for TypeScript files
    const files = readdirSync(context.blockPath);
    const tsFiles = files.filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'));

    if (tsFiles.length === 0) {
      issues.push({
        type: "error",
        code: "NO_TS_FILES",
        message: "No TypeScript files found in block folder",
        suggestion: `Create at least one .ts file in ${context.blockPath}`,
      });
      return { valid: false, issues };
    }

    // Check that at least one file has exports
    const hasExports = tsFiles.some(file => {
      const content = readFileSync(join(context.blockPath, file), "utf-8");
      return content.includes("export");
    });

    if (!hasExports) {
      issues.push({
        type: "warning",
        code: "NO_EXPORTS",
        message: "No exports found in any TypeScript file",
        suggestion: "Add export statements to expose block functions",
      });
    }

    return {
      valid: issues.filter((i) => i.type === "error").length === 0,
      issues,
    };
  }
}
