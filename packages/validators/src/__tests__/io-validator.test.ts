import { describe, it, expect } from "vitest";
import { IOSchemaValidator } from "../schema/io-validator.js";
import type { ValidatorContext } from "../types.js";

describe("IOSchemaValidator", () => {
  const validator = new IOSchemaValidator();

  function createContext(blockDefinition: Record<string, unknown>): ValidatorContext {
    return {
      blockName: "test.block",
      blockPath: "/path/to/block",
      config: {
        blocks: {
          "test.block": blockDefinition,
        },
      },
    };
  }

  describe("validate()", () => {
    it("should have correct id", () => {
      expect(validator.id).toBe("schema.io");
    });

    it("should pass for valid block with inputs and outputs", async () => {
      const context = createContext({
        description: "A test block",
        inputs: [
          { name: "data", type: "entity.resume" },
          { name: "config", type: "object" },
        ],
        outputs: [
          { name: "result", type: "string" },
          { name: "score", type: "number", semantics: ["score_0_1"] },
        ],
      });

      const result = await validator.validate(context);

      expect(result.valid).toBe(true);
      expect(result.issues.filter((i) => i.type === "error")).toHaveLength(0);
      expect(result.context?.summary).toContain("Schema validation passed");
    });

    it("should pass with empty inputs/outputs arrays", async () => {
      const context = createContext({
        description: "A block with no inputs or outputs",
        inputs: [],
        outputs: [],
      });

      const result = await validator.validate(context);

      expect(result.valid).toBe(true);
      expect(result.issues.filter((i) => i.type === "error")).toHaveLength(0);
    });

    it("should pass with no inputs/outputs defined", async () => {
      const context = createContext({
        description: "A minimal block",
      });

      const result = await validator.validate(context);

      expect(result.valid).toBe(true);
      expect(result.issues.filter((i) => i.type === "error")).toHaveLength(0);
    });

    it("should fail when input is missing name field", async () => {
      const context = createContext({
        description: "Block with invalid input",
        inputs: [{ type: "string" }],
        outputs: [{ name: "result", type: "string" }],
      });

      const result = await validator.validate(context);

      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: "error",
          code: "INVALID_INPUT_SCHEMA",
          message: expect.stringContaining("missing 'name' field"),
        })
      );
    });

    it("should fail when input is missing type field", async () => {
      const context = createContext({
        description: "Block with invalid input",
        inputs: [{ name: "data" }],
        outputs: [{ name: "result", type: "string" }],
      });

      const result = await validator.validate(context);

      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: "error",
          code: "INVALID_INPUT_SCHEMA",
          message: expect.stringContaining("missing 'type' field"),
        })
      );
    });

    it("should fail when output is missing name field", async () => {
      const context = createContext({
        description: "Block with invalid output",
        inputs: [{ name: "data", type: "string" }],
        outputs: [{ type: "string" }],
      });

      const result = await validator.validate(context);

      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: "error",
          code: "INVALID_OUTPUT_SCHEMA",
          message: expect.stringContaining("missing 'name' field"),
        })
      );
    });

    it("should fail when output is missing type field", async () => {
      const context = createContext({
        description: "Block with invalid output",
        inputs: [{ name: "data", type: "string" }],
        outputs: [{ name: "result" }],
      });

      const result = await validator.validate(context);

      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: "error",
          code: "INVALID_OUTPUT_SCHEMA",
          message: expect.stringContaining("missing 'type' field"),
        })
      );
    });

    it("should return info issue when block has no description", async () => {
      const context = createContext({
        inputs: [{ name: "data", type: "string" }],
        outputs: [{ name: "result", type: "string" }],
      });

      const result = await validator.validate(context);

      expect(result.valid).toBe(true); // info doesn't affect validity
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: "info",
          code: "MISSING_DESCRIPTION",
          message: "Block has no description",
        })
      );
    });

    it("should validate multiple inputs and outputs", async () => {
      const context = createContext({
        description: "Block with multiple I/O",
        inputs: [
          { name: "input1", type: "string" },
          { name: "input2", type: "number" },
          { name: "input3", type: "object" },
        ],
        outputs: [
          { name: "output1", type: "string" },
          { name: "output2", type: "boolean" },
        ],
      });

      const result = await validator.validate(context);

      expect(result.valid).toBe(true);
      expect(result.context?.summary).toContain("3 input(s) and 2 output(s)");
    });

    it("should include semantics in context output", async () => {
      const context = createContext({
        description: "Block with semantic outputs",
        outputs: [
          { name: "score", type: "number", semantics: ["score_0_1", "confidence"] },
        ],
      });

      const result = await validator.validate(context);

      expect(result.valid).toBe(true);
      // Semantics are tracked in checksPerformed
    });

    it("should report multiple errors at once", async () => {
      const context = createContext({
        inputs: [
          { name: "valid", type: "string" },
          { type: "number" }, // missing name
          { name: "noType" }, // missing type
        ],
        outputs: [
          { name: "result" }, // missing type
        ],
      });

      const result = await validator.validate(context);

      expect(result.valid).toBe(false);
      const errors = result.issues.filter((i) => i.type === "error");
      expect(errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});
