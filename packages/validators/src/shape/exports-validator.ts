import type { Validator, ValidatorContext, ValidationResult, ValidationIssue } from "../types.js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Shape validator - validates file structure and exports
 */
export class ExportsShapeValidator implements Validator {
  id = "shape.exports.v1";

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    // Check for required files
    const requiredFiles = ["index.ts", "block.ts"];
    for (const file of requiredFiles) {
      const filePath = join(context.blockPath, file);
      if (!existsSync(filePath)) {
        issues.push({
          type: "error",
          code: "MISSING_FILE",
          message: `Required file "${file}" not found`,
          suggestion: `Create ${file} in ${context.blockPath}`,
        });
      }
    }

    // Check that index.ts exports the block
    const indexPath = join(context.blockPath, "index.ts");
    if (existsSync(indexPath)) {
      const content = readFileSync(indexPath, "utf-8");
      if (!content.includes("export")) {
        issues.push({
          type: "warning",
          code: "NO_EXPORTS",
          message: "index.ts should export the block function",
        });
      }
    }

    return {
      valid: issues.filter((i) => i.type === "error").length === 0,
      issues,
    };
  }
}
