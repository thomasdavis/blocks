import type { BlocksConfig, BlockDefinition } from "@blocksai/schema";

/**
 * Domain Registry - Central registry for domain entities, signals, and measures
 */
export class DomainRegistry {
  private config: BlocksConfig;

  constructor(config: BlocksConfig) {
    this.config = config;
  }

  /**
   * Get all defined entities
   */
  getEntities(): Map<string, string[]> {
    const entities = new Map<string, string[]>();
    if (this.config.domain?.entities) {
      for (const [name, def] of Object.entries(this.config.domain.entities)) {
        entities.set(name, def.fields);
      }
    }
    return entities;
  }

  /**
   * Get all defined signals
   */
  getSignals(): Map<string, { description: string; extractionHint?: string }> {
    const signals = new Map();
    if (this.config.domain?.signals) {
      for (const [name, def] of Object.entries(this.config.domain.signals)) {
        signals.set(name, {
          description: def.description,
          extractionHint: def.extraction_hint,
        });
      }
    }
    return signals;
  }

  /**
   * Get all defined measures
   */
  getMeasures(): Map<string, string[]> {
    const measures = new Map<string, string[]>();
    if (this.config.domain?.measures) {
      for (const [name, def] of Object.entries(this.config.domain.measures)) {
        measures.set(name, def.constraints);
      }
    }
    return measures;
  }

  /**
   * Get a block definition by name
   */
  getBlock(name: string): BlockDefinition | undefined {
    const block = this.config.blocks[name];
    // Skip domain_rules (which is an array, not a BlockDefinition)
    if (Array.isArray(block)) {
      return undefined;
    }
    return block;
  }

  /**
   * Get all block definitions (excludes domain_rules)
   */
  getBlocks(): Map<string, BlockDefinition> {
    const entries = Object.entries(this.config.blocks).filter(
      ([key, value]) => key !== "domain_rules" && !Array.isArray(value)
    ) as [string, BlockDefinition][];
    return new Map(entries);
  }

  /**
   * Check if an entity exists
   */
  hasEntity(name: string): boolean {
    return !!this.config.domain?.entities?.[name];
  }

  /**
   * Check if a signal exists
   */
  hasSignal(name: string): boolean {
    return !!this.config.domain?.signals?.[name];
  }

  /**
   * Check if a measure exists
   */
  hasMeasure(name: string): boolean {
    return !!this.config.domain?.measures?.[name];
  }

  /**
   * Get required template sections (removed - blocks are just functions)
   */
  getRequiredTemplateSections(): string[] {
    return [];
  }

  /**
   * Get project philosophy statements
   */
  getPhilosophy(): string[] {
    return this.config.philosophy ?? [];
  }

  /**
   * Get default domain rules that apply to all blocks
   * These are defined at blocks.domain_rules
   */
  getDefaultDomainRules(): string[] {
    const defaultRules = this.config.blocks.domain_rules;
    if (!defaultRules || !Array.isArray(defaultRules)) {
      return [];
    }
    return defaultRules.map((rule) => rule.description);
  }

  /**
   * Get default domain rule IDs that apply to all blocks
   * These are defined at blocks.domain_rules
   */
  getDefaultDomainRuleIds(): string[] {
    const defaultRules = this.config.blocks.domain_rules;
    if (!defaultRules || !Array.isArray(defaultRules)) {
      return [];
    }
    return defaultRules.map((rule) => rule.id);
  }
}
