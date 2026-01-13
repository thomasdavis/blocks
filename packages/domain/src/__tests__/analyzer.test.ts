import { describe, it, expect } from "vitest";
import { DomainAnalyzer } from "../analyzer.js";
import { DomainRegistry } from "../registry.js";
import type { BlocksConfig, BlockDefinition } from "@blocksai/schema";

describe("DomainAnalyzer", () => {
  function createRegistry(config: Partial<BlocksConfig>): DomainRegistry {
    return new DomainRegistry({
      name: "test-project",
      blocks: {},
      ...config,
    });
  }

  describe("analyzeBlock()", () => {
    it("should pass for block with valid entity references", () => {
      const registry = createRegistry({
        domain: {
          entities: {
            user: { fields: ["name", "email"] },
            product: { fields: ["id", "title"] },
          },
          semantics: {},
        },
      });
      const analyzer = new DomainAnalyzer(registry);

      const block: BlockDefinition = {
        description: "User block",
        inputs: [
          { name: "user", type: "entity.user" },
          { name: "product", type: "entity.product" },
        ],
      };

      const issues = analyzer.analyzeBlock("test.block", block);

      expect(issues.filter((i) => i.type === "error")).toHaveLength(0);
    });

    it("should fail for unknown entity reference", () => {
      const registry = createRegistry({
        domain: {
          entities: {
            user: { fields: ["name"] },
          },
          semantics: {},
        },
      });
      const analyzer = new DomainAnalyzer(registry);

      const block: BlockDefinition = {
        description: "Test block",
        inputs: [
          { name: "data", type: "entity.unknown_entity" },
        ],
      };

      const issues = analyzer.analyzeBlock("test.block", block);

      expect(issues).toContainEqual(
        expect.objectContaining({
          type: "error",
          code: "UNKNOWN_ENTITY",
          message: expect.stringContaining("unknown_entity"),
        })
      );
    });

    it("should pass for block with valid semantic references", () => {
      const registry = createRegistry({
        domain: {
          entities: {},
          semantics: {
            score: { description: "Score value" },
            confidence: { description: "Confidence level" },
          },
        },
      });
      const analyzer = new DomainAnalyzer(registry);

      const block: BlockDefinition = {
        description: "Scoring block",
        outputs: [
          { name: "result", type: "number", semantics: ["score", "confidence"] },
        ],
      };

      const issues = analyzer.analyzeBlock("test.block", block);

      expect(issues.filter((i) => i.type === "error")).toHaveLength(0);
    });

    it("should fail for unknown semantic reference", () => {
      const registry = createRegistry({
        domain: {
          entities: {},
          semantics: {
            score: { description: "Score value" },
          },
        },
      });
      const analyzer = new DomainAnalyzer(registry);

      const block: BlockDefinition = {
        description: "Test block",
        outputs: [
          { name: "result", type: "number", semantics: ["score", "unknown_semantic"] },
        ],
      };

      const issues = analyzer.analyzeBlock("test.block", block);

      expect(issues).toContainEqual(
        expect.objectContaining({
          type: "error",
          code: "UNKNOWN_SEMANTIC",
          message: expect.stringContaining("unknown_semantic"),
        })
      );
    });

    it("should return empty issues for valid block", () => {
      const registry = createRegistry({
        domain: {
          entities: {
            resume: { fields: ["name", "experience"] },
          },
          semantics: {
            readability: { description: "Readability score" },
          },
        },
      });
      const analyzer = new DomainAnalyzer(registry);

      const block: BlockDefinition = {
        description: "Resume analyzer",
        inputs: [{ name: "resume", type: "entity.resume" }],
        outputs: [{ name: "score", type: "number", semantics: ["readability"] }],
      };

      const issues = analyzer.analyzeBlock("test.block", block);

      expect(issues).toHaveLength(0);
    });

    it("should handle blocks with no inputs or outputs", () => {
      const registry = createRegistry({});
      const analyzer = new DomainAnalyzer(registry);

      const block: BlockDefinition = {
        description: "Simple block",
      };

      const issues = analyzer.analyzeBlock("test.block", block);

      expect(issues).toHaveLength(0);
    });

    it("should only check entity types starting with 'entity.'", () => {
      const registry = createRegistry({
        domain: {
          entities: {},
          semantics: {},
        },
      });
      const analyzer = new DomainAnalyzer(registry);

      const block: BlockDefinition = {
        description: "Block with primitive types",
        inputs: [
          { name: "text", type: "string" },
          { name: "count", type: "number" },
          { name: "config", type: "object" },
        ],
      };

      const issues = analyzer.analyzeBlock("test.block", block);

      expect(issues.filter((i) => i.type === "error")).toHaveLength(0);
    });

    it("should handle outputs without semantics", () => {
      const registry = createRegistry({
        domain: {
          entities: {},
          semantics: {},
        },
      });
      const analyzer = new DomainAnalyzer(registry);

      const block: BlockDefinition = {
        description: "Block with plain outputs",
        outputs: [
          { name: "result", type: "string" },
          { name: "data", type: "object" },
        ],
      };

      const issues = analyzer.analyzeBlock("test.block", block);

      expect(issues.filter((i) => i.type === "error")).toHaveLength(0);
    });
  });

  describe("detectDrift()", () => {
    it("should warn about undocumented entities", () => {
      const registry = createRegistry({
        domain: {
          entities: {
            user: { fields: ["name"] },
          },
          semantics: {},
        },
      });
      const analyzer = new DomainAnalyzer(registry);

      const issues = analyzer.detectDrift("test.block", {
        entities: ["user", "undocumented_entity"],
      });

      expect(issues).toContainEqual(
        expect.objectContaining({
          type: "warning",
          code: "UNDOCUMENTED_ENTITY",
          message: expect.stringContaining("undocumented_entity"),
        })
      );
    });

    it("should warn about undocumented semantics", () => {
      const registry = createRegistry({
        domain: {
          entities: {},
          semantics: {
            score: { description: "Score" },
          },
        },
      });
      const analyzer = new DomainAnalyzer(registry);

      const issues = analyzer.detectDrift("test.block", {
        semantics: ["score", "undocumented_semantic"],
      });

      expect(issues).toContainEqual(
        expect.objectContaining({
          type: "warning",
          code: "UNDOCUMENTED_SEMANTIC",
          message: expect.stringContaining("undocumented_semantic"),
        })
      );
    });

    it("should pass when all concepts documented", () => {
      const registry = createRegistry({
        domain: {
          entities: {
            user: { fields: ["name"] },
            product: { fields: ["id"] },
          },
          semantics: {
            score: { description: "Score" },
            rating: { description: "Rating" },
          },
        },
      });
      const analyzer = new DomainAnalyzer(registry);

      const issues = analyzer.detectDrift("test.block", {
        entities: ["user", "product"],
        semantics: ["score", "rating"],
      });

      expect(issues).toHaveLength(0);
    });

    it("should handle empty detected concepts", () => {
      const registry = createRegistry({});
      const analyzer = new DomainAnalyzer(registry);

      const issues = analyzer.detectDrift("test.block", {});

      expect(issues).toHaveLength(0);
    });

    it("should handle undefined concepts gracefully", () => {
      const registry = createRegistry({});
      const analyzer = new DomainAnalyzer(registry);

      const issues = analyzer.detectDrift("test.block", {
        entities: undefined,
        semantics: undefined,
      });

      expect(issues).toHaveLength(0);
    });
  });
});
