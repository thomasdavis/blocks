import { describe, it, expect, vi } from "vitest";
import { ValidatorRegistry } from "../registry.js";
import type { BlocksConfig } from "@blocksai/schema";

// Mock AIProvider
const mockAIProvider = {
  getProviderInfo: vi.fn().mockReturnValue({ provider: "mock", model: "mock-model" }),
  validateDomainSemantics: vi.fn().mockResolvedValue({
    isValid: true,
    issues: [],
    summary: "Mock validation passed",
    _meta: { provider: "mock", model: "mock", prompt: "", response: "" },
  }),
  validateSingleDomainRule: vi.fn().mockResolvedValue({
    ruleId: "test",
    isValid: true,
    issues: [],
    summary: "Mock rule passed",
    _meta: { provider: "mock", model: "mock", prompt: "", response: "" },
  }),
};

describe("ValidatorRegistry", () => {
  const config: BlocksConfig = {
    name: "test-project",
    blocks: {},
  };

  describe("get()", () => {
    it("should return IOSchemaValidator for 'schema'", () => {
      const registry = new ValidatorRegistry(config, mockAIProvider as never);
      const validator = registry.get("schema");

      expect(validator).toBeDefined();
      expect(validator?.id).toBe("schema.io");
    });

    it("should return IOSchemaValidator for 'schema.io'", () => {
      const registry = new ValidatorRegistry(config, mockAIProvider as never);
      const validator = registry.get("schema.io");

      expect(validator).toBeDefined();
      expect(validator?.id).toBe("schema.io");
    });

    it("should return TsExportsShapeValidator for 'shape.ts'", () => {
      const registry = new ValidatorRegistry(config, mockAIProvider as never);
      const validator = registry.get("shape.ts");

      expect(validator).toBeDefined();
      expect(validator?.id).toBe("shape.exports.ts");
    });

    it("should return TsExportsShapeValidator for 'shape'", () => {
      const registry = new ValidatorRegistry(config, mockAIProvider as never);
      const validator = registry.get("shape");

      expect(validator).toBeDefined();
      expect(validator?.id).toBe("shape.exports.ts");
    });

    it("should return TsExportsShapeValidator for 'shape.exports.ts'", () => {
      const registry = new ValidatorRegistry(config, mockAIProvider as never);
      const validator = registry.get("shape.exports.ts");

      expect(validator).toBeDefined();
      expect(validator?.id).toBe("shape.exports.ts");
    });

    it("should return DomainValidator for 'domain'", () => {
      const registry = new ValidatorRegistry(config, mockAIProvider as never);
      const validator = registry.get("domain");

      expect(validator).toBeDefined();
      expect(validator?.id).toBe("domain.validation");
    });

    it("should return DomainValidator for 'domain.validation'", () => {
      const registry = new ValidatorRegistry(config, mockAIProvider as never);
      const validator = registry.get("domain.validation");

      expect(validator).toBeDefined();
      expect(validator?.id).toBe("domain.validation");
    });

    it("should return undefined for unknown validator", () => {
      const registry = new ValidatorRegistry(config, mockAIProvider as never);
      const validator = registry.get("unknown.validator");

      expect(validator).toBeUndefined();
    });
  });

  describe("has()", () => {
    it("should return true for registered validators", () => {
      const registry = new ValidatorRegistry(config, mockAIProvider as never);

      expect(registry.has("schema")).toBe(true);
      expect(registry.has("schema.io")).toBe(true);
      expect(registry.has("shape")).toBe(true);
      expect(registry.has("shape.ts")).toBe(true);
      expect(registry.has("domain")).toBe(true);
      expect(registry.has("domain.validation")).toBe(true);
    });

    it("should return false for unregistered validators", () => {
      const registry = new ValidatorRegistry(config, mockAIProvider as never);

      expect(registry.has("unknown")).toBe(false);
      expect(registry.has("custom.validator")).toBe(false);
    });
  });

  describe("register()", () => {
    it("should register custom validators", () => {
      const registry = new ValidatorRegistry(config, mockAIProvider as never);
      const customValidator = {
        id: "custom.test",
        validate: vi.fn().mockResolvedValue({ valid: true, issues: [] }),
      };

      registry.register("custom.test", customValidator);

      expect(registry.has("custom.test")).toBe(true);
    });

    it("should allow retrieval of custom validators", () => {
      const registry = new ValidatorRegistry(config, mockAIProvider as never);
      const customValidator = {
        id: "custom.test",
        validate: vi.fn().mockResolvedValue({ valid: true, issues: [] }),
      };

      registry.register("custom.test", customValidator);
      const retrieved = registry.get("custom.test");

      expect(retrieved).toBe(customValidator);
      expect(retrieved?.id).toBe("custom.test");
    });

    it("should overwrite existing validators with same id", () => {
      const registry = new ValidatorRegistry(config, mockAIProvider as never);
      const customValidator = {
        id: "schema.io",
        validate: vi.fn().mockResolvedValue({ valid: true, issues: [] }),
      };

      registry.register("schema.io", customValidator);
      const retrieved = registry.get("schema.io");

      expect(retrieved).toBe(customValidator);
    });
  });
});
