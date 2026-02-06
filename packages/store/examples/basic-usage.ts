import { BlocksStore } from "@blocksai/store";
import type { BlocksConfig } from "@blocksai/schema";

/**
 * Basic usage example for @blocksai/store
 */
async function main() {
  // Create a SQLite store
  const store = new BlocksStore("sqlite://./blocks.db");

  // Initialize tables
  await store.initialize();

  // Store some blocks
  await store.putBlock("validate-email", {
    description: "Validates email addresses",
    path: "./blocks/validate-email",
    inputs: [
      { name: "email", type: "string" },
    ],
    outputs: [
      { name: "isValid", type: "boolean" },
      { name: "error", type: "string", semantics: ["error-message"] },
    ],
  });

  await store.putBlock("send-notification", {
    description: "Sends a notification to a user",
    path: "./blocks/send-notification",
    inputs: [
      { name: "userId", type: "string" },
      { name: "message", type: "string" },
    ],
    outputs: [
      { name: "sent", type: "boolean" },
    ],
  });

  // Store domain entities
  await store.putEntity("User", {
    fields: ["id", "email", "name"],
    optional: ["phone", "avatar"],
  });

  await store.putEntity("Notification", {
    fields: ["id", "userId", "message", "sentAt"],
  });

  // Store domain semantics
  await store.putSemantic("email", {
    description: "A valid email address",
    extraction_hint: "Look for patterns like user@domain.com",
    schema: {
      type: "string",
      format: "email",
    },
  });

  await store.putSemantic("error-message", {
    description: "A human-readable error message",
    extraction_hint: "Should be clear and actionable",
  });

  // Store config values
  await store.putConfig("name", "my-validation-system");
  await store.putConfig("philosophy", [
    "Validate early and often",
    "Provide clear error messages",
  ]);

  // Retrieve data
  const block = await store.getBlock("validate-email");
  console.log("Block:", block);

  const allBlocks = await store.getBlocks();
  console.log("All blocks:", Object.keys(allBlocks));

  const entities = await store.getEntities();
  console.log("Entities:", Object.keys(entities));

  const semantics = await store.getSemantics();
  console.log("Semantics:", Object.keys(semantics));

  // Convert to full config
  const config = await store.toBlocksConfig();
  console.log("Full config:", JSON.stringify(config, null, 2));

  // Write a full config to database
  const newConfig: BlocksConfig = {
    name: "updated-system",
    blocks: {
      "new-block": {
        description: "A new block",
      },
    },
    domain: {
      entities: {
        "Product": {
          fields: ["id", "name", "price"],
        },
      },
    },
  };

  await store.fromBlocksConfig(newConfig);

  // Close connection
  await store.close();
}

main().catch(console.error);
