import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
import { BlocksStore } from "./store.js";
import type { BlocksConfig, BlockDefinition } from "@blocksai/schema";

const TEST_DB = "./test-blocks.db";

describe("BlocksStore", () => {
  let store: BlocksStore;

  beforeEach(async () => {
    // Clean up test database
    if (existsSync(TEST_DB)) {
      await unlink(TEST_DB);
    }
    if (existsSync(`${TEST_DB}-shm`)) {
      await unlink(`${TEST_DB}-shm`);
    }
    if (existsSync(`${TEST_DB}-wal`)) {
      await unlink(`${TEST_DB}-wal`);
    }

    store = new BlocksStore(`sqlite://./${TEST_DB}`);
    await store.initialize();
  });

  afterEach(async () => {
    await store.close();
    if (existsSync(TEST_DB)) {
      await unlink(TEST_DB);
    }
    if (existsSync(`${TEST_DB}-shm`)) {
      await unlink(`${TEST_DB}-shm`);
    }
    if (existsSync(`${TEST_DB}-wal`)) {
      await unlink(`${TEST_DB}-wal`);
    }
  });

  describe("Block operations", () => {
    it("should store and retrieve a block", async () => {
      const block: BlockDefinition = {
        description: "Test block",
        path: "./blocks/test",
        inputs: [{ name: "input1", type: "string" }],
        outputs: [{ name: "output1", type: "string" }],
      };

      await store.putBlock("test-block", block);
      const retrieved = await store.getBlock("test-block");

      expect(retrieved).toEqual(block);
    });

    it("should return undefined for non-existent block", async () => {
      const retrieved = await store.getBlock("non-existent");
      expect(retrieved).toBeUndefined();
    });

    it("should update existing block", async () => {
      const block: BlockDefinition = {
        description: "Initial description",
      };

      await store.putBlock("test-block", block);

      const updated: BlockDefinition = {
        description: "Updated description",
        path: "./new-path",
      };

      await store.putBlock("test-block", updated);
      const retrieved = await store.getBlock("test-block");

      expect(retrieved?.description).toBe("Updated description");
      expect(retrieved?.path).toBe("./new-path");
    });

    it("should delete a block", async () => {
      const block: BlockDefinition = {
        description: "Test block",
      };

      await store.putBlock("test-block", block);
      await store.deleteBlock("test-block");

      const retrieved = await store.getBlock("test-block");
      expect(retrieved).toBeUndefined();
    });

    it("should get all blocks", async () => {
      await store.putBlock("block1", { description: "Block 1" });
      await store.putBlock("block2", { description: "Block 2" });

      const blocks = await store.getBlocks();

      expect(Object.keys(blocks)).toHaveLength(2);
      expect(blocks["block1"]?.description).toBe("Block 1");
      expect(blocks["block2"]?.description).toBe("Block 2");
    });
  });

  describe("Entity operations", () => {
    it("should store and retrieve entities", async () => {
      await store.putEntity("User", {
        fields: ["id", "name", "email"],
        optional: ["phone"],
      });

      const entities = await store.getEntities();

      expect(entities["User"]).toEqual({
        fields: ["id", "name", "email"],
        optional: ["phone"],
      });
    });

    it("should get all entities", async () => {
      await store.putEntity("User", { fields: ["id", "name"] });
      await store.putEntity("Post", { fields: ["id", "title"] });

      const entities = await store.getEntities();

      expect(Object.keys(entities)).toHaveLength(2);
    });
  });

  describe("Semantic operations", () => {
    it("should store and retrieve semantics", async () => {
      await store.putSemantic("email", {
        description: "Valid email address",
        extraction_hint: "Look for @ symbol",
        schema: { type: "string", format: "email" },
      });

      const semantics = await store.getSemantics();

      expect(semantics["email"]).toEqual({
        description: "Valid email address",
        extraction_hint: "Look for @ symbol",
        schema: { type: "string", format: "email" },
      });
    });

    it("should get all semantics", async () => {
      await store.putSemantic("email", { description: "Email address" });
      await store.putSemantic("url", { description: "Web URL" });

      const semantics = await store.getSemantics();

      expect(Object.keys(semantics)).toHaveLength(2);
    });
  });

  describe("Config operations", () => {
    it("should store and retrieve config values", async () => {
      await store.putConfig("api_key", "secret123");
      const value = await store.getConfig("api_key");

      expect(value).toBe("secret123");
    });

    it("should return undefined for non-existent config", async () => {
      const value = await store.getConfig("non-existent");
      expect(value).toBeUndefined();
    });

    it("should store complex config objects", async () => {
      const config = {
        provider: "openai",
        model: "gpt-4",
        temperature: 0.7,
      };

      await store.putConfig("ai", config);
      const retrieved = await store.getConfig("ai");

      expect(retrieved).toEqual(config);
    });
  });

  describe("BlocksConfig conversion", () => {
    it("should convert database to BlocksConfig", async () => {
      await store.putConfig("name", "test-project");
      await store.putConfig("philosophy", ["Be clear", "Be concise"]);

      await store.putBlock("test-block", {
        description: "Test block",
        path: "./blocks/test",
      });

      await store.putEntity("User", {
        fields: ["id", "name"],
      });

      await store.putSemantic("email", {
        description: "Email address",
      });

      const config = await store.toBlocksConfig();

      expect(config.name).toBe("test-project");
      expect(config.philosophy).toEqual(["Be clear", "Be concise"]);
      expect(config.blocks["test-block"]?.description).toBe("Test block");
      expect(config.domain?.entities?.["User"]?.fields).toEqual(["id", "name"]);
      expect(config.domain?.semantics?.["email"]?.description).toBe("Email address");
    });

    it("should write BlocksConfig to database", async () => {
      const config: BlocksConfig = {
        name: "my-project",
        philosophy: ["Test philosophy"],
        blocks: {
          "block1": {
            description: "First block",
            path: "./blocks/block1",
          },
          "block2": {
            description: "Second block",
          },
        },
        domain: {
          entities: {
            "User": {
              fields: ["id", "email"],
            },
          },
          semantics: {
            "email": {
              description: "Email address",
            },
          },
        },
        validators: ["schema", "shape"],
        ai: {
          provider: "openai",
          model: "gpt-4",
        },
      };

      await store.fromBlocksConfig(config);

      const retrieved = await store.toBlocksConfig();

      expect(retrieved.name).toBe("my-project");
      expect(retrieved.philosophy).toEqual(["Test philosophy"]);
      expect(Object.keys(retrieved.blocks)).toHaveLength(2);
      expect(retrieved.domain?.entities?.["User"]?.fields).toEqual(["id", "email"]);
      expect(retrieved.domain?.semantics?.["email"]?.description).toBe("Email address");
      expect(retrieved.validators).toEqual(["schema", "shape"]);
      expect(retrieved.ai).toEqual({ provider: "openai", model: "gpt-4" });
    });
  });

  describe("URL parsing", () => {
    it("should handle SQLite relative path", async () => {
      const s = new BlocksStore("sqlite://./relative.db");
      await s.initialize();
      await s.close();
      if (existsSync("./relative.db")) await unlink("./relative.db");
      if (existsSync("./relative.db-shm")) await unlink("./relative.db-shm");
      if (existsSync("./relative.db-wal")) await unlink("./relative.db-wal");
    });

    it("should throw on unsupported protocol", async () => {
      const s = new BlocksStore("mysql://localhost/db");
      await expect(s.initialize()).rejects.toThrow("Unsupported database protocol");
    });

    it("should throw descriptive error on invalid database URL", async () => {
      const s = new BlocksStore("not-a-valid-url");
      await expect(s.initialize()).rejects.toThrow("Invalid database URL");
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle toBlocksConfig with empty database", async () => {
      const config = await store.toBlocksConfig();

      expect(config.name).toBe("unknown");
      expect(config.blocks).toEqual({});
      expect(config.domain).toBeUndefined();
      expect(config.philosophy).toBeUndefined();
      expect(config.validators).toBeUndefined();
      expect(config.ai).toBeUndefined();
    });

    it("should round-trip full config through fromBlocksConfig and toBlocksConfig", async () => {
      const originalConfig: BlocksConfig = {
        name: "round-trip-test",
        philosophy: ["Test philosophy 1", "Test philosophy 2"],
        blocks: {
          block1: {
            description: "First block",
            path: "./blocks/block1",
            inputs: [{ name: "input1", type: "string" }],
            outputs: [{ name: "output1", type: "number" }],
          },
          block2: {
            description: "Second block",
            validators: {
              custom: { rules: [{ id: "rule1", description: "Test rule" }] },
            },
          },
        },
        domain: {
          entities: {
            User: {
              fields: ["id", "email", "name"],
              optional: ["phone"],
            },
            Post: {
              fields: ["id", "title", "content"],
            },
          },
          semantics: {
            email: {
              description: "Email address",
              extraction_hint: "Look for @ symbol",
              schema: { type: "string", format: "email" },
            },
          },
        },
        validators: [
          "schema",
          {
            name: "domain",
            config: {
              rules: [{ id: "test-rule", description: "Test rule" }],
            },
          },
        ],
        ai: {
          provider: "anthropic",
          model: "claude-3-5-sonnet-20241022",
          on_failure: "warn",
        },
        cache: {
          path: "./cache",
        },
      };

      await store.fromBlocksConfig(originalConfig);
      const retrieved = await store.toBlocksConfig();

      expect(retrieved.name).toBe(originalConfig.name);
      expect(retrieved.philosophy).toEqual(originalConfig.philosophy);
      expect(retrieved.blocks).toEqual(originalConfig.blocks);
      expect(retrieved.domain).toEqual(originalConfig.domain);
      expect(retrieved.validators).toEqual(originalConfig.validators);
      expect(retrieved.ai).toEqual(originalConfig.ai);
      expect(retrieved.cache).toEqual(originalConfig.cache);
    });

    it("should handle putBlock update (upsert existing block)", async () => {
      const initialBlock: BlockDefinition = {
        description: "Initial version",
        path: "./blocks/initial",
      };

      await store.putBlock("upsert-test", initialBlock);

      const updatedBlock: BlockDefinition = {
        description: "Updated version",
        path: "./blocks/updated",
        inputs: [{ name: "new_input", type: "string" }],
      };

      await store.putBlock("upsert-test", updatedBlock);
      const retrieved = await store.getBlock("upsert-test");

      expect(retrieved).toEqual(updatedBlock);
      expect(retrieved?.description).toBe("Updated version");
      expect(retrieved?.path).toBe("./blocks/updated");
      expect(retrieved?.inputs).toEqual([{ name: "new_input", type: "string" }]);
    });

    it("should handle putEntity update (upsert existing entity)", async () => {
      const initialEntity = {
        fields: ["id", "name"],
      };

      await store.putEntity("TestEntity", initialEntity);

      const updatedEntity = {
        fields: ["id", "name", "email"],
        optional: ["phone"],
      };

      await store.putEntity("TestEntity", updatedEntity);
      const entities = await store.getEntities();

      expect(entities["TestEntity"]).toEqual(updatedEntity);
    });

    it("should handle putSemantic update (upsert existing semantic)", async () => {
      const initialSemantic = {
        description: "Initial description",
      };

      await store.putSemantic("test_semantic", initialSemantic);

      const updatedSemantic = {
        description: "Updated description",
        extraction_hint: "New hint",
        schema: { type: "string" },
      };

      await store.putSemantic("test_semantic", updatedSemantic);
      const semantics = await store.getSemantics();

      expect(semantics["test_semantic"]).toEqual(updatedSemantic);
    });

    it("should handle putConfig update (upsert existing config key)", async () => {
      await store.putConfig("test_key", "initial_value");
      await store.putConfig("test_key", "updated_value");

      const value = await store.getConfig("test_key");
      expect(value).toBe("updated_value");
    });

    it("should not throw when deleting non-existent block", async () => {
      await expect(
        store.deleteBlock("non-existent-block")
      ).resolves.not.toThrow();

      const retrieved = await store.getBlock("non-existent-block");
      expect(retrieved).toBeUndefined();
    });

    it("should return undefined for getBlock on non-existent block", async () => {
      const result = await store.getBlock("does-not-exist");
      expect(result).toBeUndefined();
    });
  });
});
