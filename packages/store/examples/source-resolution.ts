import { resolveConfig } from "@blocksai/store";
import type { BlocksConfig } from "@blocksai/schema";

/**
 * Example of resolving configurations from multiple sources
 */
async function main() {
  // Local configuration
  const localConfig: BlocksConfig = {
    name: "my-project",
    blocks: {
      "local-block": {
        description: "A block defined locally",
        path: "./blocks/local",
      },
    },
    domain: {
      entities: {
        "User": {
          fields: ["id", "email"],
        },
      },
    },
    philosophy: ["Local philosophy 1"],
  };

  // Define sources to merge from
  const sources = [
    // Pull from a shared file
    {
      type: "file" as const,
      path: "./shared-blocks.yml",
    },
    // Pull from a database
    {
      type: "database" as const,
      url: "sqlite://./shared.db",
      sync: "pull" as const,
    },
  ];

  // Resolve and merge all configs
  // - Sources are applied in order
  // - Local config is merged last (local wins)
  const mergedConfig = await resolveConfig(localConfig, sources);

  console.log("Merged configuration:");
  console.log(JSON.stringify(mergedConfig, null, 2));

  // The merged config will contain:
  // - All blocks from shared file + shared db + local (local wins on conflicts)
  // - All entities from shared file + shared db + local (local wins on conflicts)
  // - All semantics from shared file + shared db + local (local wins on conflicts)
  // - Philosophy statements concatenated and deduped
  // - Local config wins for ai, cache, validators
}

main().catch(console.error);
