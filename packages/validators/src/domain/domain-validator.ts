import type { BlockDefinition } from "@blocksai/schema";
import { DomainAnalyzer, DomainRegistry } from "@blocksai/domain";
import { AIProvider } from "@blocksai/ai";
import type { Validator, ValidatorContext, ValidationResult, ValidationIssue } from "../types.js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Domain validator - validates semantic alignment with domain spec
 */
export class DomainValidator implements Validator {
  id = "domain.validation.v1";

  private ai: AIProvider;
  private registry: DomainRegistry;
  private analyzer: DomainAnalyzer;

  constructor(config: any, ai: AIProvider) {
    this.ai = ai;
    this.registry = new DomainRegistry(config);
    this.analyzer = new DomainAnalyzer(this.registry);
  }

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const block: BlockDefinition = context.config.blocks[context.blockName];

    // First, run static domain analysis
    const domainIssues = this.analyzer.analyzeBlock(context.blockName, block);
    for (const issue of domainIssues) {
      issues.push({
        type: issue.type,
        code: issue.code,
        message: issue.message,
        suggestion: issue.suggestion,
      });
    }

    // Read the actual code
    const blockFilePath = join(context.blockPath, "block.ts");
    if (!existsSync(blockFilePath)) {
      issues.push({
        type: "error",
        code: "MISSING_IMPLEMENTATION",
        message: "block.ts not found",
      });
      return { valid: false, issues };
    }

    const code = readFileSync(blockFilePath, "utf-8");

    // Use AI to validate semantic alignment
    try {
      const domainRules = block.domain_rules?.map((r) => r.description) ?? [];
      const validation = await this.ai.validateDomainSemantics({
        blockName: context.blockName,
        blockDefinition: JSON.stringify(block, null, 2),
        code,
        domainRules,
      });

      for (const issue of validation.issues) {
        issues.push({
          type: issue.severity,
          code: "DOMAIN_SEMANTIC_ISSUE",
          message: issue.message,
          file: "block.ts",
        });
      }
    } catch (error) {
      issues.push({
        type: "warning",
        code: "AI_VALIDATION_FAILED",
        message: `AI validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }

    return {
      valid: issues.filter((i) => i.type === "error").length === 0,
      issues,
    };
  }
}
