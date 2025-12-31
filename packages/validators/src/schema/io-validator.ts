import type { BlockDefinition } from "@blocksai/schema";
import type { Validator, ValidatorContext, ValidationResult, ValidationIssue } from "../types.js";

/**
 * Schema validator - validates input/output signatures
 */
export class IOSchemaValidator implements Validator {
  id = "schema.io";

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const block: BlockDefinition = context.config.blocks?.[context.blockName] || context.config;
    const rulesApplied: string[] = [];
    const checksPerformed: string[] = [];

    // Track what we're validating
    const inputCount = block.inputs?.length ?? 0;
    const outputCount = block.outputs?.length ?? 0;

    // Rule: All inputs must have name and type
    rulesApplied.push("input_schema_complete");
    if (block.inputs) {
      checksPerformed.push(`Validating ${inputCount} input definition(s)`);
      for (const input of block.inputs) {
        if (!input.name) {
          issues.push({
            type: "error",
            code: "INVALID_INPUT_SCHEMA",
            message: `Input missing 'name' field`,
            suggestion: "Add a name field to identify this input",
          });
        }
        if (!input.type) {
          issues.push({
            type: "error",
            code: "INVALID_INPUT_SCHEMA",
            message: `Input "${input.name || 'unnamed'}" missing 'type' field`,
            suggestion: "Add a type field (e.g., 'entity.resume', 'string', etc.)",
          });
        }
        if (input.name && input.type) {
          checksPerformed.push(`  ✓ Input "${input.name}" has valid schema (type: ${input.type})`);
        }
      }
    } else {
      checksPerformed.push("No inputs defined (optional)");
    }

    // Rule: All outputs must have name and type
    rulesApplied.push("output_schema_complete");
    if (block.outputs) {
      checksPerformed.push(`Validating ${outputCount} output definition(s)`);
      for (const output of block.outputs) {
        if (!output.name) {
          issues.push({
            type: "error",
            code: "INVALID_OUTPUT_SCHEMA",
            message: `Output missing 'name' field`,
            suggestion: "Add a name field to identify this output",
          });
        }
        if (!output.type) {
          issues.push({
            type: "error",
            code: "INVALID_OUTPUT_SCHEMA",
            message: `Output "${output.name || 'unnamed'}" missing 'type' field`,
            suggestion: "Add a type field (e.g., 'entity.score_result', 'string', etc.)",
          });
        }
        if (output.name && output.type) {
          checksPerformed.push(`  ✓ Output "${output.name}" has valid schema (type: ${output.type})`);
          // Check for measures
          if (output.measures && output.measures.length > 0) {
            checksPerformed.push(`    └─ Measures: ${output.measures.join(", ")}`);
          }
        }
      }
    } else {
      checksPerformed.push("No outputs defined (optional)");
    }

    // Check for description (info, not error)
    rulesApplied.push("block_has_description");
    if (!block.description) {
      issues.push({
        type: "info",
        code: "MISSING_DESCRIPTION",
        message: "Block has no description",
        suggestion: "Add a description to document the block's purpose",
      });
    } else {
      checksPerformed.push(`✓ Block has description: "${block.description.substring(0, 50)}${block.description.length > 50 ? '...' : ''}"`);
    }

    const valid = issues.filter((i) => i.type === "error").length === 0;
    const summary = valid
      ? `Schema validation passed. Validated ${inputCount} input(s) and ${outputCount} output(s). All schemas are complete with name and type fields.`
      : `Schema validation failed. Found ${issues.filter(i => i.type === 'error').length} error(s) in input/output definitions.`;

    return {
      valid,
      issues,
      context: {
        filesAnalyzed: ["blocks.yml"],
        rulesApplied,
        summary,
        // Store detailed checks for display
        input: {
          blockName: context.blockName,
          inputs: block.inputs || [],
          outputs: block.outputs || [],
          description: block.description,
          path: block.path,
        },
        output: {
          checksPerformed,
          inputCount,
          outputCount,
          hasDescription: !!block.description,
        },
      } as any,
    };
  }
}
