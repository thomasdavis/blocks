import type {
  BlocksConfig,
  BlockDefinition,
  DomainRule,
  ValidatorEntry,
} from "@blocksai/schema";

/**
 * Domain Registry - Central registry for domain entities and semantics
 * Updated for Blocks Spec v2.0
 */
export class DomainRegistry {
  private config: BlocksConfig;

  constructor(config: BlocksConfig) {
    this.config = config;
  }

  /**
   * Get all defined entities with their fields and optional fields
   */
  getEntities(): Map<
    string,
    { fields: string[]; optional?: string[] }
  > {
    const entities = new Map<
      string,
      { fields: string[]; optional?: string[] }
    >();
    if (this.config.domain?.entities) {
      for (const [name, def] of Object.entries(this.config.domain.entities)) {
        entities.set(name, {
          fields: def.fields,
          optional: def.optional,
        });
      }
    }
    return entities;
  }

  /**
   * Get all defined semantics (merged signals + measures from v1.0)
   */
  getSemantics(): Map<
    string,
    { description: string; extractionHint?: string; schema?: unknown }
  > {
    const semantics = new Map<
      string,
      { description: string; extractionHint?: string; schema?: unknown }
    >();
    if (this.config.domain?.semantics) {
      for (const [name, def] of Object.entries(this.config.domain.semantics)) {
        semantics.set(name, {
          description: def.description,
          extractionHint: def.extraction_hint,
          schema: def.schema,
        });
      }
    }
    return semantics;
  }

  /**
   * Get a block definition by name
   */
  getBlock(name: string): BlockDefinition | undefined {
    return this.config.blocks[name];
  }

  /**
   * Get all block definitions
   */
  getBlocks(): Map<string, BlockDefinition> {
    return new Map(Object.entries(this.config.blocks));
  }

  /**
   * Check if an entity exists
   */
  hasEntity(name: string): boolean {
    return !!this.config.domain?.entities?.[name];
  }

  /**
   * Check if a semantic exists
   */
  hasSemantic(name: string): boolean {
    return !!this.config.domain?.semantics?.[name];
  }

  /**
   * Get project philosophy statements
   */
  getPhilosophy(): string[] {
    return this.config.philosophy ?? [];
  }

  /**
   * Get domain rules from the domain validator config
   * In v2.0, rules are defined in validators[].config.rules
   */
  getDomainRules(): DomainRule[] {
    if (!this.config.validators) {
      return [];
    }

    for (const validator of this.config.validators) {
      if (typeof validator === "string") {
        continue;
      }
      if (validator.name === "domain" && validator.config?.rules) {
        return validator.config.rules;
      }
    }
    return [];
  }

  /**
   * Get domain rules as descriptions (for backward compatibility)
   */
  getDomainRuleDescriptions(): string[] {
    return this.getDomainRules().map((rule) => rule.description);
  }

  /**
   * Get domain rules with IDs (for parallel rule validation)
   */
  getDomainRulesWithIds(): Array<{ id: string; description: string }> {
    return this.getDomainRules().map((rule) => ({
      id: rule.id,
      description: rule.description,
    }));
  }

  /**
   * Get merged domain rules for a specific block
   * Block-level rules are deep merged with global rules
   */
  getBlockDomainRules(blockName: string): DomainRule[] {
    const globalRules = this.getDomainRules();
    const block = this.getBlock(blockName);

    if (!block?.validators?.domain?.rules) {
      return globalRules;
    }

    // Deep merge: add block rules, dedup by ID
    const blockRules = block.validators.domain.rules as DomainRule[];
    const ruleMap = new Map<string, DomainRule>();

    for (const rule of globalRules) {
      ruleMap.set(rule.id, rule);
    }
    for (const rule of blockRules) {
      ruleMap.set(rule.id, rule);
    }

    return Array.from(ruleMap.values());
  }

  /**
   * Check if a block should skip a specific validator
   */
  shouldSkipValidator(blockName: string, validatorName: string): boolean {
    const block = this.getBlock(blockName);
    return block?.skip_validators?.includes(validatorName) ?? false;
  }

  /**
   * Get file exclusion patterns for a block
   */
  getBlockExcludePatterns(blockName: string): string[] {
    const block = this.getBlock(blockName);
    return block?.exclude ?? [];
  }

  /**
   * Get the validators array from config
   */
  getValidators(): ValidatorEntry[] {
    return this.config.validators ?? [];
  }
}
