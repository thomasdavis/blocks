import { describe, it, expect } from "vitest";
import { parseBlocksConfig, validateBlocksConfig, isValidBlocksConfig } from "../parser.js";

const validYaml = `
name: "Test Project"

blocks:
  test_block:
    description: "Test block"
`;

describe("parseBlocksConfig", () => {
  it("should parse valid YAML config", () => {
    const config = parseBlocksConfig(validYaml);
    expect(config.name).toBe("Test Project");
    expect(config.blocks.test_block).toBeDefined();
    expect(config.blocks.test_block.description).toBe("Test block");
  });

  it("should throw on invalid YAML", () => {
    expect(() => parseBlocksConfig("invalid: [yaml")).toThrow();
  });

  it("should throw on missing required fields", () => {
    const invalidYaml = `
blocks:
  test_block:
    path: "blocks/test"
`;
    expect(() => parseBlocksConfig(invalidYaml)).toThrow();
  });
});

describe("validateBlocksConfig", () => {
  it("should validate valid config object", () => {
    const config = {
      name: "Test",
      blocks: {
        test: {
          description: "Test",
        },
      },
    };
    expect(() => validateBlocksConfig(config)).not.toThrow();
  });
});

describe("isValidBlocksConfig", () => {
  it("should return true for valid config", () => {
    const config = {
      name: "Test",
      blocks: {
        test: {
          description: "Test",
        },
      },
    };
    expect(isValidBlocksConfig(config)).toBe(true);
  });

  it("should return false for invalid config", () => {
    const config = {
      blocks: {},
    };
    expect(isValidBlocksConfig(config)).toBe(false);
  });
});

describe("validators with domain rules", () => {
  it("should parse domain validator with rules config", () => {
    const yaml = `
name: "Test Project"

blocks:
  test_block:
    description: "Test block"

validators:
  - schema
  - name: domain
    config:
      rules:
        - id: rule1
          description: "Rule 1"
        - id: rule2
          description: "Rule 2"
`;
    const config = parseBlocksConfig(yaml);
    expect(config.validators).toHaveLength(2);
    const domainValidator = config.validators?.[1];
    expect(domainValidator).toEqual({
      name: "domain",
      config: {
        rules: [
          { id: "rule1", description: "Rule 1" },
          { id: "rule2", description: "Rule 2" },
        ],
      },
    });
  });

  it("should parse block-level validator config", () => {
    const yaml = `
name: "Test"

blocks:
  test_block:
    description: "Test block"
    validators:
      domain:
        rules:
          - id: block_rule
            description: "Block-specific rule"
`;
    const config = parseBlocksConfig(yaml);
    expect(config.blocks.test_block.validators).toBeDefined();
    expect(config.blocks.test_block.validators?.domain).toEqual({
      rules: [{ id: "block_rule", description: "Block-specific rule" }],
    });
  });
});

describe("ValidatorsSchema", () => {
  it("should allow omitting validators field (uses smart defaults)", () => {
    const yaml = `
name: "Test"

blocks:
  test_block:
    description: "Test block"
`;
    const config = parseBlocksConfig(yaml);
    expect(config.validators).toBeUndefined();
  });

  it("should parse string array validators", () => {
    const yaml = `
name: "Test"

blocks:
  test_block:
    description: "Test block"

validators:
  - schema
  - domain
`;
    const config = parseBlocksConfig(yaml);
    expect(config.validators).toEqual(["schema", "domain"]);
  });

  it("should parse mixed string/object validators", () => {
    const yaml = `
name: "Test"

blocks:
  test_block:
    description: "Test block"

validators:
  - schema
  - name: custom_linter
    run: lint.custom
  - domain
`;
    const config = parseBlocksConfig(yaml);
    expect(config.validators).toHaveLength(3);
    expect(config.validators[0]).toBe("schema");
    expect(config.validators[1]).toEqual({ name: "custom_linter", run: "lint.custom" });
    expect(config.validators[2]).toBe("domain");
  });

  it("should parse validator object with optional config", () => {
    const yaml = `
name: "Test"

blocks:
  test_block:
    description: "Test block"

validators:
  - schema
  - name: strict_eslint
    run: lint.eslint
    config:
      severity: error
      maxWarnings: 0
`;
    const config = parseBlocksConfig(yaml);
    expect(config.validators).toHaveLength(2);
    expect(config.validators[1]).toEqual({
      name: "strict_eslint",
      run: "lint.eslint",
      config: { severity: "error", maxWarnings: 0 }
    });
  });

  it("should support all built-in validator short names", () => {
    const yaml = `
name: "Test"

blocks:
  test_block:
    description: "Test block"

validators:
  - schema
  - shape.ts
  - domain
`;
    const config = parseBlocksConfig(yaml);
    expect(config.validators).toEqual(["schema", "shape.ts", "domain"]);
  });
});
