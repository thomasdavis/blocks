import type { Validator } from "./types.js";
import { IOSchemaValidator } from "./schema/io-validator.js";
import { TsExportsShapeValidator } from "./shape/ts-exports-validator.js";
import { DomainValidator } from "./domain/domain-validator.js";
import type { AIProvider } from "@blocksai/ai";
import type { BlocksConfig } from "@blocksai/schema";

/**
 * Built-in validator name mappings
 * Maps short, user-friendly names to technical validator IDs
 */
const BUILT_IN_VALIDATORS = {
  schema: "schema.io",
  shape: "shape.exports.ts",
  "shape.ts": "shape.exports.ts",
  domain: "domain.validation",
} as const;

/**
 * Validator registry - maps validator IDs to implementations
 *
 * Provides a central registry for all validators, supporting both
 * built-in validators (with short name aliases) and custom validators.
 */
export class ValidatorRegistry {
  private validators = new Map<string, Validator>();

  constructor(config: BlocksConfig, ai: AIProvider) {
    // Register built-in validators
    this.validators.set("schema.io", new IOSchemaValidator());
    this.validators.set("shape.exports.ts", new TsExportsShapeValidator());
    this.validators.set("domain.validation", new DomainValidator(config, ai));
  }

  /**
   * Get validator by short name or technical ID
   *
   * @param nameOrId - Short name (e.g., "schema") or technical ID (e.g., "schema.io")
   * @returns Validator instance if found, undefined otherwise
   *
   * @example
   * const validator = registry.get("schema");  // Returns IOSchemaValidator
   * const validator = registry.get("schema.io");  // Also returns IOSchemaValidator
   */
  get(nameOrId: string): Validator | undefined {
    // Check if it's a short name that needs mapping
    const technicalId = BUILT_IN_VALIDATORS[nameOrId as keyof typeof BUILT_IN_VALIDATORS] ?? nameOrId;
    return this.validators.get(technicalId);
  }

  /**
   * Check if validator exists
   *
   * @param nameOrId - Short name or technical ID
   * @returns true if validator is registered, false otherwise
   */
  has(nameOrId: string): boolean {
    const technicalId = BUILT_IN_VALIDATORS[nameOrId as keyof typeof BUILT_IN_VALIDATORS] ?? nameOrId;
    return this.validators.has(technicalId);
  }

  /**
   * Register custom validator
   *
   * @param id - Technical ID for the validator
   * @param validator - Validator implementation
   */
  register(id: string, validator: Validator): void {
    this.validators.set(id, validator);
  }
}
