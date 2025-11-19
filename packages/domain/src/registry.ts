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
}
