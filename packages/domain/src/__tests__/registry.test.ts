import { describe, it, expect } from "vitest";
import { DomainRegistry } from "../registry.js";
import type { BlocksConfig } from "@blocksai/schema";

describe("DomainRegistry", () => {
  describe("getEntities()", () => {
    it("should return all defined entities", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {},
        domain: {
          entities: {
            user: { fields: ["name", "email"], optional: ["phone"] },
            product: { fields: ["id", "title", "price"] },
          },
          semantics: {},
        },
      };

      const registry = new DomainRegistry(config);
      const entities = registry.getEntities();

      expect(entities.size).toBe(2);
      expect(entities.get("user")).toEqual({
        fields: ["name", "email"],
        optional: ["phone"],
      });
      expect(entities.get("product")).toEqual({
        fields: ["id", "title", "price"],
        optional: undefined,
      });
    });

    it("should return empty map when no entities defined", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {},
      };

      const registry = new DomainRegistry(config);
      const entities = registry.getEntities();

      expect(entities.size).toBe(0);
    });
  });

  describe("getSemantics()", () => {
    it("should return all defined semantics", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {},
        domain: {
          entities: {},
          semantics: {
            readability: {
              description: "Text readability score",
              extraction_hint: "Use Flesch-Kincaid",
            },
            engagement: {
              description: "User engagement metric",
              schema: { type: "number", min: 0, max: 100 },
            },
          },
        },
      };

      const registry = new DomainRegistry(config);
      const semantics = registry.getSemantics();

      expect(semantics.size).toBe(2);
      expect(semantics.get("readability")).toEqual({
        description: "Text readability score",
        extractionHint: "Use Flesch-Kincaid",
        schema: undefined,
      });
      expect(semantics.get("engagement")).toEqual({
        description: "User engagement metric",
        extractionHint: undefined,
        schema: { type: "number", min: 0, max: 100 },
      });
    });

    it("should return empty map when no semantics defined", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {},
      };

      const registry = new DomainRegistry(config);
      const semantics = registry.getSemantics();

      expect(semantics.size).toBe(0);
    });
  });

  describe("getBlock()", () => {
    it("should return block definition by name", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {
          "theme.modern": {
            description: "Modern theme",
            path: "blocks/theme.modern",
          },
          "theme.classic": {
            description: "Classic theme",
          },
        },
      };

      const registry = new DomainRegistry(config);
      const block = registry.getBlock("theme.modern");

      expect(block).toBeDefined();
      expect(block?.description).toBe("Modern theme");
      expect(block?.path).toBe("blocks/theme.modern");
    });

    it("should return undefined for unknown block", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {},
      };

      const registry = new DomainRegistry(config);
      const block = registry.getBlock("nonexistent");

      expect(block).toBeUndefined();
    });
  });

  describe("hasEntity()", () => {
    it("should return true for existing entity", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {},
        domain: {
          entities: { user: { fields: ["name"] } },
          semantics: {},
        },
      };

      const registry = new DomainRegistry(config);

      expect(registry.hasEntity("user")).toBe(true);
    });

    it("should return false for non-existing entity", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {},
      };

      const registry = new DomainRegistry(config);

      expect(registry.hasEntity("nonexistent")).toBe(false);
    });
  });

  describe("hasSemantic()", () => {
    it("should return true for existing semantic", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {},
        domain: {
          entities: {},
          semantics: { score: { description: "Score value" } },
        },
      };

      const registry = new DomainRegistry(config);

      expect(registry.hasSemantic("score")).toBe(true);
    });

    it("should return false for non-existing semantic", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {},
      };

      const registry = new DomainRegistry(config);

      expect(registry.hasSemantic("nonexistent")).toBe(false);
    });
  });

  describe("getPhilosophy()", () => {
    it("should return philosophy statements", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {},
        philosophy: [
          "Code should be simple",
          "Tests are documentation",
        ],
      };

      const registry = new DomainRegistry(config);
      const philosophy = registry.getPhilosophy();

      expect(philosophy).toEqual([
        "Code should be simple",
        "Tests are documentation",
      ]);
    });

    it("should return empty array when no philosophy defined", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {},
      };

      const registry = new DomainRegistry(config);
      const philosophy = registry.getPhilosophy();

      expect(philosophy).toEqual([]);
    });
  });

  describe("getDomainRules()", () => {
    it("should extract rules from validator config", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {},
        validators: [
          "schema",
          {
            name: "domain",
            config: {
              rules: [
                { id: "semantic_html", description: "Use semantic HTML" },
                { id: "aria_labels", description: "Include ARIA labels" },
              ],
            },
          },
        ],
      };

      const registry = new DomainRegistry(config);
      const rules = registry.getDomainRules();

      expect(rules).toHaveLength(2);
      expect(rules[0]).toEqual({ id: "semantic_html", description: "Use semantic HTML" });
      expect(rules[1]).toEqual({ id: "aria_labels", description: "Include ARIA labels" });
    });

    it("should return empty array when no domain validator", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {},
        validators: ["schema", "shape.ts"],
      };

      const registry = new DomainRegistry(config);
      const rules = registry.getDomainRules();

      expect(rules).toEqual([]);
    });

    it("should return empty array when no validators defined", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {},
      };

      const registry = new DomainRegistry(config);
      const rules = registry.getDomainRules();

      expect(rules).toEqual([]);
    });
  });

  describe("getBlockDomainRules()", () => {
    it("should merge global and block rules", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {
          "theme.creative": {
            description: "Creative theme",
            validators: {
              domain: {
                rules: [
                  { id: "creative_freedom", description: "Allow creative freedom" },
                ],
              },
            },
          },
        },
        validators: [
          {
            name: "domain",
            config: {
              rules: [
                { id: "semantic_html", description: "Use semantic HTML" },
              ],
            },
          },
        ],
      };

      const registry = new DomainRegistry(config);
      const rules = registry.getBlockDomainRules("theme.creative");

      expect(rules).toHaveLength(2);
      expect(rules.map((r) => r.id)).toContain("semantic_html");
      expect(rules.map((r) => r.id)).toContain("creative_freedom");
    });

    it("should deduplicate rules by ID (block wins)", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {
          "theme.override": {
            description: "Override theme",
            validators: {
              domain: {
                rules: [
                  { id: "shared_rule", description: "Block-level description" },
                ],
              },
            },
          },
        },
        validators: [
          {
            name: "domain",
            config: {
              rules: [
                { id: "shared_rule", description: "Global description" },
              ],
            },
          },
        ],
      };

      const registry = new DomainRegistry(config);
      const rules = registry.getBlockDomainRules("theme.override");

      expect(rules).toHaveLength(1);
      expect(rules[0].description).toBe("Block-level description");
    });

    it("should return global rules when block has no specific rules", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {
          "theme.basic": {
            description: "Basic theme",
          },
        },
        validators: [
          {
            name: "domain",
            config: {
              rules: [
                { id: "global_rule", description: "Global rule" },
              ],
            },
          },
        ],
      };

      const registry = new DomainRegistry(config);
      const rules = registry.getBlockDomainRules("theme.basic");

      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe("global_rule");
    });
  });

  describe("shouldSkipValidator()", () => {
    it("should return true when validator in skip list", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {
          "util.helper": {
            description: "Utility block",
            skip_validators: ["domain", "shape.ts"],
          },
        },
      };

      const registry = new DomainRegistry(config);

      expect(registry.shouldSkipValidator("util.helper", "domain")).toBe(true);
      expect(registry.shouldSkipValidator("util.helper", "shape.ts")).toBe(true);
    });

    it("should return false when validator not in skip list", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {
          "util.helper": {
            description: "Utility block",
            skip_validators: ["domain"],
          },
        },
      };

      const registry = new DomainRegistry(config);

      expect(registry.shouldSkipValidator("util.helper", "schema")).toBe(false);
    });

    it("should return false when no skip_validators defined", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {
          "util.helper": {
            description: "Utility block",
          },
        },
      };

      const registry = new DomainRegistry(config);

      expect(registry.shouldSkipValidator("util.helper", "domain")).toBe(false);
    });
  });

  describe("getBlockExcludePatterns()", () => {
    it("should return exclude patterns for block", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {
          "theme.modern": {
            description: "Modern theme",
            exclude: ["*.test.ts", "fixtures/**"],
          },
        },
      };

      const registry = new DomainRegistry(config);
      const patterns = registry.getBlockExcludePatterns("theme.modern");

      expect(patterns).toEqual(["*.test.ts", "fixtures/**"]);
    });

    it("should return empty array when no exclude patterns", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {
          "theme.modern": {
            description: "Modern theme",
          },
        },
      };

      const registry = new DomainRegistry(config);
      const patterns = registry.getBlockExcludePatterns("theme.modern");

      expect(patterns).toEqual([]);
    });
  });

  describe("getValidators()", () => {
    it("should return validators array from config", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {},
        validators: ["schema", { name: "domain", config: {} }],
      };

      const registry = new DomainRegistry(config);
      const validators = registry.getValidators();

      expect(validators).toHaveLength(2);
      expect(validators[0]).toBe("schema");
      expect(validators[1]).toEqual({ name: "domain", config: {} });
    });

    it("should return empty array when no validators defined", () => {
      const config: BlocksConfig = {
        name: "test-project",
        blocks: {},
      };

      const registry = new DomainRegistry(config);
      const validators = registry.getValidators();

      expect(validators).toEqual([]);
    });
  });
});
