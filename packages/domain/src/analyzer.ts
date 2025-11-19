import type { BlockDefinition } from "@blocksai/schema";
import { DomainRegistry } from "./registry.js";

export interface DomainIssue {
  type: "error" | "warning" | "info";
  code: string;
  message: string;
  suggestion?: string;
}

/**
 * Domain Analyzer - Validates blocks against domain semantics
 */
export class DomainAnalyzer {
  private registry: DomainRegistry;

  constructor(registry: DomainRegistry) {
    this.registry = registry;
  }

  /**
   * Analyze a block definition for domain compliance
   */
  analyzeBlock(blockName: string, block: BlockDefinition): DomainIssue[] {
    const issues: DomainIssue[] = [];

    // Check inputs reference valid entities
    if (block.inputs) {
      for (const input of block.inputs) {
        if (input.type.startsWith("entity.")) {
          const entityName = input.type.replace("entity.", "");
          if (!this.registry.hasEntity(entityName)) {
            issues.push({
              type: "error",
              code: "UNKNOWN_ENTITY",
              message: `Input "${input.name}" references unknown entity "${entityName}"`,
              suggestion: `Add entity "${entityName}" to domain.entities or use a different type`,
            });
          }
        }
      }
    }

    // Check outputs reference valid measures
    if (block.outputs) {
      for (const output of block.outputs) {
        if (output.measures) {
          for (const measure of output.measures) {
            const measureName = measure.replace("measure.", "");
            if (!this.registry.hasMeasure(measureName)) {
              issues.push({
                type: "error",
                code: "UNKNOWN_MEASURE",
                message: `Output "${output.name}" references unknown measure "${measureName}"`,
                suggestion: `Add measure "${measureName}" to domain.measures`,
              });
            }
          }
        }
      }
    }

    // Check template sections
    if (block.type === "template" && block.sections) {
      const requiredSections = this.registry.getRequiredTemplateSections();
      const missingSections = requiredSections.filter((req) => !block.sections?.includes(req));

      if (missingSections.length > 0) {
        issues.push({
          type: "warning",
          code: "MISSING_TEMPLATE_SECTIONS",
          message: `Template is missing required sections: ${missingSections.join(", ")}`,
          suggestion: `Add sections: ${missingSections.join(", ")}`,
        });
      }
    }

    return issues;
  }

  /**
   * Check for undocumented concepts in code
   * This would be called by validators that analyze actual code
   */
  detectDrift(
    blockName: string,
    detectedConcepts: {
      entities?: string[];
      signals?: string[];
      measures?: string[];
      outputs?: string[];
    }
  ): DomainIssue[] {
    const issues: DomainIssue[] = [];

    // Check for undocumented entities
    if (detectedConcepts.entities) {
      for (const entity of detectedConcepts.entities) {
        if (!this.registry.hasEntity(entity)) {
          issues.push({
            type: "warning",
            code: "UNDOCUMENTED_ENTITY",
            message: `Block "${blockName}" references undocumented entity "${entity}"`,
            suggestion: `Consider adding "${entity}" to domain.entities in blocks.yml`,
          });
        }
      }
    }

    // Check for undocumented signals
    if (detectedConcepts.signals) {
      for (const signal of detectedConcepts.signals) {
        if (!this.registry.hasSignal(signal)) {
          issues.push({
            type: "warning",
            code: "UNDOCUMENTED_SIGNAL",
            message: `Block "${blockName}" uses undocumented signal "${signal}"`,
            suggestion: `Consider adding "${signal}" to domain.signals in blocks.yml`,
          });
        }
      }
    }

    // Check for undocumented measures
    if (detectedConcepts.measures) {
      for (const measure of detectedConcepts.measures) {
        if (!this.registry.hasMeasure(measure)) {
          issues.push({
            type: "warning",
            code: "UNDOCUMENTED_MEASURE",
            message: `Block "${blockName}" uses undocumented measure "${measure}"`,
            suggestion: `Consider adding "${measure}" to domain.measures in blocks.yml`,
          });
        }
      }
    }

    return issues;
  }
}
