import { describe, it, expect } from "vitest";
import { parseBlocksConfig, validateBlocksConfig, isValidBlocksConfig } from "../parser.js";

const validYaml = `
project:
  name: "Test Project"
  domain: "test.domain"

blocks:
  test_block:
    description: "Test block"
`;

describe("parseBlocksConfig", () => {
  it("should parse valid YAML config", () => {
    const config = parseBlocksConfig(validYaml);
    expect(config.project.name).toBe("Test Project");
    expect(config.project.domain).toBe("test.domain");
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
      project: {
        name: "Test",
        domain: "test.domain",
      },
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
      project: {
        name: "Test",
        domain: "test.domain",
      },
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
project:
  name: "Test Project"
  domain: "test.domain"

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
project:
  name: "Test"
  domain: "test"

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
project:
  name: "Test"
  domain: "test"

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
