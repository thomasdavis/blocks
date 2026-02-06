/**
 * Seed script — populates a SQLite database with shared API standards.
 *
 * Run: npx tsx seed.ts
 *
 * This creates `shared-api-standards.db` with entities, semantics, and
 * philosophy that any project can pull via `sources:` in blocks.yml.
 */

import { BlocksStore } from "@blocksai/store";

const DB_URL = "sqlite://./shared-api-standards.db";

async function seed() {
  const store = new BlocksStore(DB_URL);
  await store.initialize();

  // -- Project name --
  await store.putConfig("name", "Shared API Standards");

  // -- Philosophy (team-wide conventions) --
  await store.putConfig("philosophy", [
    "API endpoints must follow RESTful conventions.",
    "Every response must include appropriate HTTP status codes.",
    "Error responses must be structured and machine-readable.",
  ]);

  // -- Shared entities --
  await store.putEntity("api_request", {
    fields: ["method", "path", "headers", "query", "body"],
    optional: ["body", "query"],
  });

  await store.putEntity("api_response", {
    fields: ["status", "headers", "body"],
  });

  await store.putEntity("error_response", {
    fields: ["status", "error", "message"],
    optional: ["details"],
  });

  // -- Shared semantics --
  await store.putSemantic("rest_compliance", {
    description: "Endpoint must follow REST conventions: proper HTTP methods, status codes, and resource naming",
    extraction_hint: "Check HTTP method usage, URL patterns, status code selection",
  });

  await store.putSemantic("error_handling", {
    description: "Errors must return structured responses with status code, error type, and message",
    extraction_hint: "Look for try/catch blocks, error response formatting, status code mapping",
  });

  // -- A shared block definition (e.g. a health-check endpoint all services must implement) --
  await store.putBlock("endpoint.health", {
    description: "GET /health endpoint — returns service health status",
    inputs: [
      { name: "request", type: "entity.api_request" },
    ],
    outputs: [
      {
        name: "response",
        type: "entity.api_response",
        semantics: ["rest_compliance"],
        constraints: ["Must return 200 with { status: 'ok' }"],
      },
    ],
  });

  await store.close();

  console.log("Seeded shared-api-standards.db with:");
  console.log("  - 3 entities (api_request, api_response, error_response)");
  console.log("  - 2 semantics (rest_compliance, error_handling)");
  console.log("  - 3 philosophy statements");
  console.log("  - 1 shared block (endpoint.health)");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
