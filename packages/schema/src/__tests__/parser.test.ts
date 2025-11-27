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

describe("blocks.domain_rules", () => {
  it("should parse default domain_rules at blocks level", () => {
    const yamlWithDefaults = `
name: "Test Project"

blocks:
  domain_rules:
    - id: rule1
      description: "Default rule 1"
    - id: rule2
      description: "Default rule 2"

  test_block:
    description: "Test block"
`;
    const config = parseBlocksConfig(yamlWithDefaults);
    expect(config.blocks.domain_rules).toBeDefined();
    expect(config.blocks.domain_rules).toHaveLength(2);
    expect(config.blocks.domain_rules[0].id).toBe("rule1");
    expect(config.blocks.domain_rules[0].description).toBe("Default rule 1");
  });

  it("should support blocks with both default rules and block definitions", () => {
    const yaml = `
name: "Test"

blocks:
  domain_rules:
    - id: default
      description: "Default rule"

  block1:
    description: "Block 1"

  block2:
    description: "Block 2"
    domain_rules:
      - id: specific
        description: "Block-specific rule"
`;
    const config = parseBlocksConfig(yaml);
    expect(config.blocks.domain_rules).toBeDefined();
    expect(config.blocks.domain_rules).toHaveLength(1);
    expect(config.blocks.block1).toBeDefined();
    expect(config.blocks.block1.description).toBe("Block 1");
    expect(config.blocks.block1.domain_rules).toBeUndefined();
    expect(config.blocks.block2).toBeDefined();
    expect(config.blocks.block2.domain_rules).toHaveLength(1);
    expect(config.blocks.block2.domain_rules[0].id).toBe("specific");
  });

  it("should allow blocks without default domain_rules", () => {
    const yaml = `
name: "Test"

blocks:
  test_block:
    description: "Test block"
    domain_rules:
      - id: specific
        description: "Specific rule"
`;
    const config = parseBlocksConfig(yaml);
    expect(config.blocks.domain_rules).toBeUndefined();
    expect(config.blocks.test_block.domain_rules).toHaveLength(1);
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
      rules: ["error"]
`;
    const config = parseBlocksConfig(yaml);
    expect(config.validators).toHaveLength(2);
    expect(config.validators[1]).toEqual({
      name: "strict_eslint",
      run: "lint.eslint",
      config: { rules: ["error"] }
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
