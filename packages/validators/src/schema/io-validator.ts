import type { BlockDefinition } from "@blocks/schema";
import type { Validator, ValidatorContext, ValidationResult, ValidationIssue } from "../types.js";

/**
 * Schema validator - validates input/output signatures
 */
export class IOSchemaValidator implements Validator {
  id = "schema.io.v1";

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const block: BlockDefinition = context.config;

    // Check that inputs are defined if referenced
    if (block.inputs) {
      for (const input of block.inputs) {
        if (!input.name || !input.type) {
          issues.push({
            type: "error",
            code: "INVALID_INPUT_SCHEMA",
            message: `Input must have both 'name' and 'type' fields`,
          });
        }
      }
    }

    // Check that outputs are defined if referenced
    if (block.outputs) {
      for (const output of block.outputs) {
        if (!output.name || !output.type) {
          issues.push({
            type: "error",
            code: "INVALID_OUTPUT_SCHEMA",
            message: `Output "${output.name}" must have both 'name' and 'type' fields`,
          });
        }
      }
    }

    return {
      valid: issues.filter((i) => i.type === "error").length === 0,
      issues,
    };
  }
}
