import { describe, it, expect, afterEach } from "vitest";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import { unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { resolveConfig } from "../resolver.js";
import { BlocksStore } from "../store.js";
import type { BlocksConfig, SourceEntry } from "@blocksai/schema";

const TEMP_DIR = tmpdir();
const tempFile = (name: string) => join(TEMP_DIR, `blocks-test-${name}.yml`);
const tempDb = (name: string) => join(TEMP_DIR, `blocks-test-${name}.db`);

describe("resolveConfig", () => {
  const tempFiles: string[] = [];
  const tempDbs: string[] = [];

  afterEach(async () => {
    // Clean up temp YAML files
    for (const file of tempFiles) {
      if (existsSync(file)) {
        unlinkSync(file);
      }
    }
    tempFiles.length = 0;

    // Clean up temp databases
    for (const db of tempDbs) {
      if (existsSync(db)) {
        await unlink(db);
      }
      if (existsSync(`${db}-shm`)) {
        await unlink(`${db}-shm`);
      }
      if (existsSync(`${db}-wal`)) {
        await unlink(`${db}-wal`);
      }
    }
    tempDbs.length = 0;
  });

  describe("empty sources", () => {
    it("should return local config unchanged with empty sources array", async () => {
      const localConfig: BlocksConfig = {
        name: "local-project",
        blocks: {
          test: { description: "Test block" },
        },
      };

      const result = await resolveConfig(localConfig, []);

      expect(result).toEqual(localConfig);
    });
  });

  describe("file source merging", () => {
    it("should merge blocks from file source", async () => {
      const sourceFile = tempFile("source-blocks");
      tempFiles.push(sourceFile);

      writeFileSync(
        sourceFile,
        `
name: "source-project"
blocks:
  source_block:
    description: "Block from source"
    path: "./source/block"
`
      );

      const localConfig: BlocksConfig = {
        name: "local-project",
        blocks: {
          local_block: { description: "Local block" },
        },
      };

      const sources: SourceEntry[] = [
        { type: "file", path: sourceFile },
      ];

      const result = await resolveConfig(localConfig, sources);

      expect(result.name).toBe("local-project"); // Local wins
      expect(result.blocks.source_block).toEqual({
        description: "Block from source",
        path: "./source/block",
      });
      expect(result.blocks.local_block).toEqual({
        description: "Local block",
      });
    });

    it("should allow local config to override blocks on name conflicts", async () => {
      const sourceFile = tempFile("source-override");
      tempFiles.push(sourceFile);

      writeFileSync(
        sourceFile,
        `
name: "source-project"
blocks:
  shared_block:
    description: "Source version"
    path: "./source/path"
`
      );

      const localConfig: BlocksConfig = {
        name: "local-project",
        blocks: {
          shared_block: {
            description: "Local version",
            path: "./local/path",
          },
        },
      };

      const sources: SourceEntry[] = [
        { type: "file", path: sourceFile },
      ];

      const result = await resolveConfig(localConfig, sources);

      expect(result.blocks.shared_block).toEqual({
        description: "Local version",
        path: "./local/path",
      });
    });

    it("should merge domain entities from file source", async () => {
      const sourceFile = tempFile("source-entities");
      tempFiles.push(sourceFile);

      writeFileSync(
        sourceFile,
        `
name: "source-project"
blocks:
  test: { description: "Test" }
domain:
  entities:
    User:
      fields: ["id", "email"]
    Post:
      fields: ["id", "title"]
`
      );

      const localConfig: BlocksConfig = {
        name: "local-project",
        blocks: {
          test: { description: "Test" },
        },
        domain: {
          entities: {
            Comment: {
              fields: ["id", "text"],
            },
          },
        },
      };

      const sources: SourceEntry[] = [
        { type: "file", path: sourceFile },
      ];

      const result = await resolveConfig(localConfig, sources);

      expect(result.domain?.entities).toEqual({
        User: { fields: ["id", "email"] },
        Post: { fields: ["id", "title"] },
        Comment: { fields: ["id", "text"] },
      });
    });

    it("should merge domain semantics from file source", async () => {
      const sourceFile = tempFile("source-semantics");
      tempFiles.push(sourceFile);

      writeFileSync(
        sourceFile,
        `
name: "source-project"
blocks:
  test: { description: "Test" }
domain:
  semantics:
    email:
      description: "Email address"
      extraction_hint: "Look for @ symbol"
`
      );

      const localConfig: BlocksConfig = {
        name: "local-project",
        blocks: {
          test: { description: "Test" },
        },
        domain: {
          semantics: {
            url: {
              description: "Web URL",
            },
          },
        },
      };

      const sources: SourceEntry[] = [
        { type: "file", path: sourceFile },
      ];

      const result = await resolveConfig(localConfig, sources);

      expect(result.domain?.semantics).toEqual({
        email: {
          description: "Email address",
          extraction_hint: "Look for @ symbol",
        },
        url: {
          description: "Web URL",
        },
      });
    });

    it("should allow local entities to win on conflicts", async () => {
      const sourceFile = tempFile("source-entity-conflict");
      tempFiles.push(sourceFile);

      writeFileSync(
        sourceFile,
        `
name: "source-project"
blocks:
  test: { description: "Test" }
domain:
  entities:
    User:
      fields: ["id", "email"]
      optional: ["phone"]
`
      );

      const localConfig: BlocksConfig = {
        name: "local-project",
        blocks: {
          test: { description: "Test" },
        },
        domain: {
          entities: {
            User: {
              fields: ["id", "name", "email"],
            },
          },
        },
      };

      const sources: SourceEntry[] = [
        { type: "file", path: sourceFile },
      ];

      const result = await resolveConfig(localConfig, sources);

      // Local version should win completely
      expect(result.domain?.entities?.User).toEqual({
        fields: ["id", "name", "email"],
      });
    });
  });

  describe("philosophy merging", () => {
    it("should concatenate and dedupe philosophy arrays", async () => {
      const sourceFile = tempFile("source-philosophy");
      tempFiles.push(sourceFile);

      writeFileSync(
        sourceFile,
        `
name: "source-project"
blocks:
  test: { description: "Test" }
philosophy:
  - "Be clear"
  - "Be concise"
  - "Be consistent"
`
      );

      const localConfig: BlocksConfig = {
        name: "local-project",
        blocks: {
          test: { description: "Test" },
        },
        philosophy: ["Be concise", "Be helpful"],
      };

      const sources: SourceEntry[] = [
        { type: "file", path: sourceFile },
      ];

      const result = await resolveConfig(localConfig, sources);

      expect(result.philosophy).toEqual([
        "Be clear",
        "Be concise",
        "Be consistent",
        "Be helpful",
      ]);
    });
  });

  describe("validators, ai, cache merging", () => {
    it("should use validators from override when present", async () => {
      const sourceFile = tempFile("source-validators");
      tempFiles.push(sourceFile);

      writeFileSync(
        sourceFile,
        `
name: "source-project"
blocks:
  test: { description: "Test" }
validators:
  - schema
  - shape
`
      );

      const localConfig: BlocksConfig = {
        name: "local-project",
        blocks: {
          test: { description: "Test" },
        },
        validators: ["domain"],
      };

      const sources: SourceEntry[] = [
        { type: "file", path: sourceFile },
      ];

      const result = await resolveConfig(localConfig, sources);

      // Local validators win completely
      expect(result.validators).toEqual(["domain"]);
    });

    it("should use ai config from override when present", async () => {
      const sourceFile = tempFile("source-ai");
      tempFiles.push(sourceFile);

      writeFileSync(
        sourceFile,
        `
name: "source-project"
blocks:
  test: { description: "Test" }
ai:
  provider: anthropic
  model: claude-3-5-sonnet-20241022
`
      );

      const localConfig: BlocksConfig = {
        name: "local-project",
        blocks: {
          test: { description: "Test" },
        },
        ai: {
          provider: "openai",
          model: "gpt-4o-mini",
        },
      };

      const sources: SourceEntry[] = [
        { type: "file", path: sourceFile },
      ];

      const result = await resolveConfig(localConfig, sources);

      // Local AI config wins completely
      expect(result.ai).toEqual({
        provider: "openai",
        model: "gpt-4o-mini",
      });
    });

    it("should use name from override", async () => {
      const sourceFile = tempFile("source-name");
      tempFiles.push(sourceFile);

      writeFileSync(
        sourceFile,
        `
name: "source-project"
blocks:
  test: { description: "Test" }
`
      );

      const localConfig: BlocksConfig = {
        name: "local-project",
        blocks: {
          test: { description: "Test" },
        },
      };

      const sources: SourceEntry[] = [
        { type: "file", path: sourceFile },
      ];

      const result = await resolveConfig(localConfig, sources);

      expect(result.name).toBe("local-project");
    });
  });

  describe("error handling", () => {
    it("should throw descriptive error when file source not found", async () => {
      const nonExistentFile = tempFile("does-not-exist");

      const localConfig: BlocksConfig = {
        name: "local-project",
        blocks: {
          test: { description: "Test" },
        },
      };

      const sources: SourceEntry[] = [
        { type: "file", path: nonExistentFile },
      ];

      await expect(
        resolveConfig(localConfig, sources)
      ).rejects.toThrow(`Source file not found: ${nonExistentFile}`);
    });

    it("should throw error when database source is missing url", async () => {
      const localConfig: BlocksConfig = {
        name: "local-project",
        blocks: {
          test: { description: "Test" },
        },
      };

      // Force a source without url (bypassing TS)
      const sources = [
        { type: "database" } as any,
      ];

      await expect(
        resolveConfig(localConfig, sources)
      ).rejects.toThrow("Database source missing 'url' field");
    });

    it("should throw error when file source is missing path", async () => {
      const localConfig: BlocksConfig = {
        name: "local-project",
        blocks: {
          test: { description: "Test" },
        },
      };

      // Force a source without path (bypassing TS)
      const sources = [
        { type: "file" } as any,
      ];

      await expect(
        resolveConfig(localConfig, sources)
      ).rejects.toThrow("File source missing 'path' field");
    });
  });

  describe("multiple sources", () => {
    it("should merge multiple sources in order with local config last", async () => {
      const source1 = tempFile("source1");
      const source2 = tempFile("source2");
      tempFiles.push(source1, source2);

      writeFileSync(
        source1,
        `
name: "source1"
blocks:
  block1:
    description: "From source 1"
  shared:
    description: "Source 1 version"
`
      );

      writeFileSync(
        source2,
        `
name: "source2"
blocks:
  block2:
    description: "From source 2"
  shared:
    description: "Source 2 version"
`
      );

      const localConfig: BlocksConfig = {
        name: "local",
        blocks: {
          block3: { description: "Local block" },
          shared: { description: "Local version" },
        },
      };

      const sources: SourceEntry[] = [
        { type: "file", path: source1 },
        { type: "file", path: source2 },
      ];

      const result = await resolveConfig(localConfig, sources);

      expect(result.name).toBe("local");
      expect(result.blocks.block1).toEqual({ description: "From source 1" });
      expect(result.blocks.block2).toEqual({ description: "From source 2" });
      expect(result.blocks.block3).toEqual({ description: "Local block" });
      expect(result.blocks.shared).toEqual({ description: "Local version" });
    });
  });

  describe("database source resolution", () => {
    it("should resolve database source and merge config", async () => {
      const dbPath = tempDb("test-source");
      tempDbs.push(dbPath);

      const dbUrl = `sqlite://${dbPath}`;

      // Create and populate database
      const store = new BlocksStore(dbUrl);
      await store.initialize();

      await store.putConfig("name", "db-project");
      await store.putBlock("db_block", {
        description: "Block from database",
        path: "./db/block",
      });
      await store.putEntity("User", {
        fields: ["id", "name"],
      });

      await store.close();

      // Now resolve with this database as a source
      const localConfig: BlocksConfig = {
        name: "local-project",
        blocks: {
          local_block: { description: "Local block" },
        },
      };

      const sources: SourceEntry[] = [
        { type: "database", url: dbUrl },
      ];

      const result = await resolveConfig(localConfig, sources);

      expect(result.name).toBe("local-project"); // Local wins
      expect(result.blocks.db_block).toEqual({
        description: "Block from database",
        path: "./db/block",
      });
      expect(result.blocks.local_block).toEqual({
        description: "Local block",
      });
      expect(result.domain?.entities?.User).toEqual({
        fields: ["id", "name"],
      });
    });

    it("should merge multiple database and file sources together", async () => {
      const dbPath = tempDb("test-mixed");
      tempDbs.push(dbPath);

      const fileSource = tempFile("mixed-source");
      tempFiles.push(fileSource);

      // Setup database
      const store = new BlocksStore(`sqlite://${dbPath}`);
      await store.initialize();
      await store.putConfig("name", "db-source");
      await store.putBlock("db_block", {
        description: "From DB",
      });
      await store.close();

      // Setup file
      writeFileSync(
        fileSource,
        `
name: "file-source"
blocks:
  file_block:
    description: "From file"
`
      );

      const localConfig: BlocksConfig = {
        name: "local",
        blocks: {
          local_block: { description: "Local" },
        },
      };

      const sources: SourceEntry[] = [
        { type: "database", url: `sqlite://${dbPath}` },
        { type: "file", path: fileSource },
      ];

      const result = await resolveConfig(localConfig, sources);

      expect(result.blocks.db_block).toBeDefined();
      expect(result.blocks.file_block).toBeDefined();
      expect(result.blocks.local_block).toBeDefined();
      expect(result.name).toBe("local");
    });
  });
});
