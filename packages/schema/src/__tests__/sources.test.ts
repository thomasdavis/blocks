import { describe, it, expect } from "vitest";
import { parseBlocksConfig } from "../parser.js";

describe("sources configuration", () => {
  it("should parse config without sources", () => {
    const yaml = `
name: "Test"
blocks:
  test: { description: "Test" }
`;
    const config = parseBlocksConfig(yaml);
    expect(config.sources).toBeUndefined();
  });

  it("should parse config with a database source", () => {
    const yaml = `
name: "Test"
blocks:
  test: { description: "Test" }
sources:
  - type: database
    url: "sqlite:///path/to/blocks.db"
    sync: pull
`;
    const config = parseBlocksConfig(yaml);
    expect(config.sources).toHaveLength(1);
    expect(config.sources?.[0]).toEqual({
      type: "database",
      url: "sqlite:///path/to/blocks.db",
      sync: "pull",
    });
  });

  it("should parse config with a file source", () => {
    const yaml = `
name: "Test"
blocks:
  test: { description: "Test" }
sources:
  - type: file
    path: "./shared-blocks.yml"
`;
    const config = parseBlocksConfig(yaml);
    expect(config.sources).toHaveLength(1);
    expect(config.sources?.[0]).toEqual({
      type: "file",
      path: "./shared-blocks.yml",
    });
  });

  it("should parse config with multiple sources (mixed database + file)", () => {
    const yaml = `
name: "Test"
blocks:
  test: { description: "Test" }
sources:
  - type: database
    url: "postgres://user:pass@host/db"
    sync: sync
  - type: file
    path: "./base-blocks.yml"
  - type: database
    url: "sqlite://./local.db"
`;
    const config = parseBlocksConfig(yaml);
    expect(config.sources).toHaveLength(3);
    expect(config.sources?.[0]).toEqual({
      type: "database",
      url: "postgres://user:pass@host/db",
      sync: "sync",
    });
    expect(config.sources?.[1]).toEqual({
      type: "file",
      path: "./base-blocks.yml",
    });
    expect(config.sources?.[2]).toEqual({
      type: "database",
      url: "sqlite://./local.db",
    });
  });

  it("should parse config with database source - sync defaults to undefined when omitted", () => {
    const yaml = `
name: "Test"
blocks:
  test: { description: "Test" }
sources:
  - type: database
    url: "sqlite:///path/to/blocks.db"
`;
    const config = parseBlocksConfig(yaml);
    expect(config.sources).toHaveLength(1);
    expect(config.sources?.[0]).toEqual({
      type: "database",
      url: "sqlite:///path/to/blocks.db",
    });
    expect(config.sources?.[0]).not.toHaveProperty("sync");
  });

  describe("sync modes", () => {
    it("should accept sync mode: pull", () => {
      const yaml = `
name: "Test"
blocks:
  test: { description: "Test" }
sources:
  - type: database
    url: "sqlite:///blocks.db"
    sync: pull
`;
      const config = parseBlocksConfig(yaml);
      expect(config.sources?.[0]).toMatchObject({
        type: "database",
        sync: "pull",
      });
    });

    it("should accept sync mode: push", () => {
      const yaml = `
name: "Test"
blocks:
  test: { description: "Test" }
sources:
  - type: database
    url: "sqlite:///blocks.db"
    sync: push
`;
      const config = parseBlocksConfig(yaml);
      expect(config.sources?.[0]).toMatchObject({
        type: "database",
        sync: "push",
      });
    });

    it("should accept sync mode: sync", () => {
      const yaml = `
name: "Test"
blocks:
  test: { description: "Test" }
sources:
  - type: database
    url: "sqlite:///blocks.db"
    sync: sync
`;
      const config = parseBlocksConfig(yaml);
      expect(config.sources?.[0]).toMatchObject({
        type: "database",
        sync: "sync",
      });
    });
  });

  describe("validation errors", () => {
    it("should fail validation on invalid source type", () => {
      const yaml = `
name: "Test"
blocks:
  test: { description: "Test" }
sources:
  - type: invalid_type
    url: "sqlite:///blocks.db"
`;
      expect(() => parseBlocksConfig(yaml)).toThrow();
    });

    it("should fail when database source is missing url", () => {
      const yaml = `
name: "Test"
blocks:
  test: { description: "Test" }
sources:
  - type: database
    sync: pull
`;
      expect(() => parseBlocksConfig(yaml)).toThrow();
    });

    it("should fail when file source is missing path", () => {
      const yaml = `
name: "Test"
blocks:
  test: { description: "Test" }
sources:
  - type: file
`;
      expect(() => parseBlocksConfig(yaml)).toThrow();
    });

    it("should fail on invalid sync mode", () => {
      const yaml = `
name: "Test"
blocks:
  test: { description: "Test" }
sources:
  - type: database
    url: "sqlite:///blocks.db"
    sync: invalid_mode
`;
      expect(() => parseBlocksConfig(yaml)).toThrow();
    });
  });
});
