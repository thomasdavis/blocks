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
