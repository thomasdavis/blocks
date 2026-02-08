/**
 * Sync all official TPMJS tools to the public Blocks registry on Turso.
 *
 * Reads the blocks.yml from the tpmjs monorepo and pushes all entities,
 * semantics, and block definitions to the Turso-backed BlocksStore.
 *
 * Run: npx tsx scripts/sync-tpmjs-to-registry.ts
 *
 * Requires:
 *   - TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env
 *   - TPMJS_BLOCKS_YML path (defaults to ~/repos/tpmjs/tpmjs/packages/tools/official/blocks.yml)
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { parse as parseYaml } from "yaml";
import { BlocksStore } from "../packages/store/src/store.js";
import type { BlockDefinition, DomainEntity, DomainSemantic } from "../packages/schema/src/types.js";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in environment");
  process.exit(1);
}

const blocksYmlPath =
  process.env.TPMJS_BLOCKS_YML ||
  `${process.env.HOME}/repos/tpmjs/tpmjs/packages/tools/official/blocks.yml`;

async function sync() {
  console.log(`Reading ${blocksYmlPath}...`);
  const raw = readFileSync(blocksYmlPath, "utf-8");
  const data = parseYaml(raw);

  const store = new BlocksStore(url!, { authToken });
  await store.initialize();

  // ───────────────────────────────
  // Project metadata
  // ───────────────────────────────
  await store.putConfig("name", "Blocks Official Registry");

  if (data.philosophy && Array.isArray(data.philosophy)) {
    await store.putConfig("philosophy", data.philosophy);
    console.log(`  Philosophy: ${data.philosophy.length} statements`);
  }

  // Map domain_rules to validators config
  if (data.domain_rules && Array.isArray(data.domain_rules)) {
    const rules = data.domain_rules.map((r: any) => ({
      id: r.id,
      description: typeof r.description === "string" ? r.description.trim() : String(r.description),
    }));
    await store.putConfig("validators", [
      "schema",
      "shape",
      { name: "domain", config: { rules } },
    ]);
    console.log(`  Domain rules: ${rules.length}`);
  }

  // ───────────────────────────────
  // Domain entities
  // ───────────────────────────────
  let entityCount = 0;
  if (data.domain?.entities) {
    for (const [name, raw] of Object.entries(data.domain.entities as Record<string, any>)) {
      const entity: DomainEntity = {
        fields: raw.fields || [],
      };
      if (raw.optional) {
        entity.optional = raw.optional;
      }
      await store.putEntity(name, entity);
      entityCount++;
    }
  }
  console.log(`  Entities: ${entityCount}`);

  // ───────────────────────────────
  // Domain semantics (from measures)
  // ───────────────────────────────
  let semanticCount = 0;
  if (data.domain?.measures) {
    for (const [name, raw] of Object.entries(data.domain.measures as Record<string, any>)) {
      const semantic: DomainSemantic = {
        description: raw.constraints
          ? raw.constraints.join("; ")
          : `${name} quality measure`,
      };
      if (raw.severity) {
        semantic.extraction_hint = `Severity: ${raw.severity}`;
      }
      await store.putSemantic(name, semantic);
      semanticCount++;
    }
  }
  console.log(`  Semantics (from measures): ${semanticCount}`);

  // ───────────────────────────────
  // Blocks
  // ───────────────────────────────
  let blockCount = 0;
  if (data.blocks) {
    for (const [name, raw] of Object.entries(data.blocks as Record<string, any>)) {
      const block: BlockDefinition = {
        description: raw.description || "",
      };

      if (raw.path) {
        block.path = raw.path;
      }

      // Map inputs
      if (raw.inputs && Array.isArray(raw.inputs)) {
        block.inputs = raw.inputs.map((inp: any) => ({
          name: inp.name,
          type: inp.type,
          ...(inp.optional !== undefined ? { optional: inp.optional } : {}),
        }));
      }

      // Map outputs — convert measures to semantics
      if (raw.outputs && Array.isArray(raw.outputs)) {
        block.outputs = raw.outputs.map((out: any) => ({
          name: out.name,
          type: out.type,
          ...(out.measures ? { semantics: out.measures } : {}),
          ...(out.constraints ? { constraints: out.constraints } : {}),
        }));
      }

      await store.putBlock(name, block);
      blockCount++;
    }
  }
  console.log(`  Blocks: ${blockCount}`);

  await store.close();

  console.log("\nSync complete!");
  console.log(`  Total: ${entityCount} entities, ${semanticCount} semantics, ${blockCount} blocks`);
}

sync().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
