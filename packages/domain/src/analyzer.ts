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

    // Check outputs reference valid semantics
    if (block.outputs) {
      for (const output of block.outputs) {
        if (output.semantics) {
          for (const semantic of output.semantics) {
            if (!this.registry.hasSemantic(semantic)) {
              issues.push({
                type: "error",
                code: "UNKNOWN_SEMANTIC",
                message: `Output "${output.name}" references unknown semantic "${semantic}"`,
                suggestion: `Add semantic "${semantic}" to domain.semantics`,
              });
            }
          }
        }
      }
    }

    // Template sections check removed - blocks are just functions

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
      semantics?: string[];
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

    // Check for undocumented semantics
    if (detectedConcepts.semantics) {
      for (const semantic of detectedConcepts.semantics) {
        if (!this.registry.hasSemantic(semantic)) {
          issues.push({
            type: "warning",
            code: "UNDOCUMENTED_SEMANTIC",
            message: `Block "${blockName}" uses undocumented semantic "${semantic}"`,
            suggestion: `Consider adding "${semantic}" to domain.semantics in blocks.yml`,
          });
        }
      }
    }

    return issues;
  }
}
