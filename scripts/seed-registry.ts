/**
 * Seed the official Blocks registry on Turso.
 *
 * Run: npx tsx scripts/seed-registry.ts
 *
 * Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env
 */

import "dotenv/config";
import { BlocksStore } from "../packages/store/src/store.js";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in environment");
  process.exit(1);
}

async function seed() {
  const store = new BlocksStore(url!, { authToken });
  await store.initialize();

  // ───────────────────────────────
  // Project metadata
  // ───────────────────────────────
  await store.putConfig("name", "Blocks Official Registry");

  await store.putConfig("philosophy", [
    "Blocks must be small, composable, and deterministic.",
    "Express domain intent clearly in code — not in comments.",
    "All semantic validation happens at development time, not runtime.",
    "Trust validated source code at runtime.",
    "Handlers should do one thing well: receive input, process, return output.",
  ]);

  await store.putConfig("validators", [
    "schema",
    "shape",
    { name: "domain", config: { rules: [
      { id: "single_responsibility", description: "Each block does one thing: accepts typed input, processes, returns typed output" },
      { id: "deterministic_output", description: "Same input must always produce the same output — no hidden state or side effects" },
      { id: "explicit_errors", description: "All error paths must return structured responses, never throw unhandled exceptions" },
    ]}},
  ]);

  // ───────────────────────────────
  // Shared entities
  // ───────────────────────────────
  await store.putEntity("resume", {
    fields: ["basics", "work", "education", "skills", "languages", "interests", "references"],
    optional: ["volunteer", "awards", "publications"],
  });

  await store.putEntity("blog_post", {
    fields: ["title", "content", "author", "published_at"],
    optional: ["tags", "excerpt", "cover_image", "slug"],
  });

  await store.putEntity("api_request", {
    fields: ["method", "path", "headers"],
    optional: ["query", "body"],
  });

  await store.putEntity("api_response", {
    fields: ["status", "headers", "body"],
  });

  await store.putEntity("error_response", {
    fields: ["status", "error", "message"],
    optional: ["details", "code"],
  });

  await store.putEntity("email_context", {
    fields: ["to", "subject", "template_data"],
    optional: ["from", "reply_to", "cc"],
  });

  await store.putEntity("html_output", {
    fields: ["html"],
    optional: ["metadata"],
  });

  await store.putEntity("score_result", {
    fields: ["score", "reasoning"],
    optional: ["matched_items", "gaps", "confidence"],
  });

  await store.putEntity("theme_config", {
    fields: ["colors", "fonts"],
    optional: ["layout", "spacing", "custom"],
  });

  await store.putEntity("validation_result", {
    fields: ["valid", "issues"],
    optional: ["score", "suggestions"],
  });

  // ───────────────────────────────
  // Shared semantics
  // ───────────────────────────────
  await store.putSemantic("readability", {
    description: "How easy is the output to read and scan for humans?",
    extraction_hint: "Look for proper typography, spacing, visual hierarchy, clear structure",
  });

  await store.putSemantic("accessibility", {
    description: "WCAG compliance and screen reader friendliness",
    extraction_hint: "Verify semantic HTML, ARIA labels, color contrast, heading hierarchy",
  });

  await store.putSemantic("valid_html", {
    description: "Output must be valid HTML5 that passes W3C validation",
    extraction_hint: "Check for proper doctype, closing tags, valid attributes",
  });

  await store.putSemantic("responsive_layout", {
    description: "Must work on mobile (320px+), tablet (768px+), and desktop (1024px+)",
    extraction_hint: "Look for CSS media queries, flexible layouts, viewport meta",
  });

  await store.putSemantic("rest_compliance", {
    description: "Endpoint must follow REST conventions: proper HTTP methods, status codes, resource naming",
    extraction_hint: "Check HTTP method usage, URL patterns, status code selection",
  });

  await store.putSemantic("error_handling", {
    description: "Errors must return structured JSON with status code, error type, and message",
    extraction_hint: "Look for try/catch blocks, error formatting, status code mapping",
  });

  await store.putSemantic("input_validation", {
    description: "All inputs must be validated with clear error messages before processing",
    extraction_hint: "Look for type checks, bounds validation, required field checks",
  });

  await store.putSemantic("tone_quality", {
    description: "Writing tone must match the intended audience and purpose",
    extraction_hint: "Assess formality level, word choice, sentence structure",
  });

  await store.putSemantic("score_0_1", {
    description: "Numeric score between 0.0 and 1.0 with explained reasoning",
    extraction_hint: "Verify score is bounded [0,1], reasoning references specific data points",
  });

  await store.putSemantic("professional_tone", {
    description: "Output conveys professionalism and credibility",
    extraction_hint: "Assess color choices, typography, language formality",
  });

  // ───────────────────────────────
  // Block 1: Resume Theme
  // ───────────────────────────────
  await store.putBlock("theme.modern_resume", {
    description: "Clean, modern resume theme — renders JSON Resume data into responsive HTML with semantic structure and print styles",
    inputs: [
      { name: "resume", type: "entity.resume" },
      { name: "config", type: "entity.theme_config", optional: true },
    ],
    outputs: [
      {
        name: "html",
        type: "entity.html_output",
        semantics: ["valid_html", "responsive_layout", "accessibility", "readability", "professional_tone"],
        constraints: [
          "Must use semantic HTML5 tags (header, main, section, article)",
          "Must include print-friendly CSS with @media print",
          "Must have proper heading hierarchy (h1 > h2 > h3)",
          "Must include ARIA labels for all sections",
        ],
      },
    ],
  });

  // ───────────────────────────────
  // Block 2: Blog Post Validator
  // ───────────────────────────────
  await store.putBlock("validator.blog_quality", {
    description: "Validates blog post quality — checks readability, tone consistency, and structural completeness",
    inputs: [
      { name: "post", type: "entity.blog_post" },
    ],
    outputs: [
      {
        name: "result",
        type: "entity.validation_result",
        semantics: ["readability", "tone_quality"],
        constraints: [
          "Must check for minimum content length (300+ words)",
          "Must verify heading structure exists",
          "Must assess reading level (target: grade 8-12)",
          "Must flag missing metadata (tags, excerpt)",
        ],
      },
    ],
  });

  // ───────────────────────────────
  // Block 3: API Endpoint Handler
  // ───────────────────────────────
  await store.putBlock("endpoint.user_api", {
    description: "GET /users endpoint — returns paginated user list with input validation and structured error responses",
    inputs: [
      { name: "request", type: "entity.api_request" },
    ],
    outputs: [
      {
        name: "response",
        type: "entity.api_response",
        semantics: ["rest_compliance", "error_handling", "input_validation"],
        constraints: [
          "Must return 200 with user array and pagination metadata on success",
          "Must return 400 with entity.error_response for invalid parameters",
          "Must support page and per_page query parameters",
          "Must validate all query parameters before processing",
        ],
      },
    ],
  });

  // ───────────────────────────────
  // Block 4: Email Template
  // ───────────────────────────────
  await store.putBlock("template.welcome_email", {
    description: "Welcome email template — renders a personalized onboarding email with responsive HTML for all email clients",
    inputs: [
      { name: "context", type: "entity.email_context" },
      { name: "config", type: "entity.theme_config", optional: true },
    ],
    outputs: [
      {
        name: "html",
        type: "entity.html_output",
        semantics: ["valid_html", "readability", "professional_tone"],
        constraints: [
          "Must use table-based layout for email client compatibility",
          "Must include plain-text fallback content",
          "Must inline all CSS styles",
          "Must include unsubscribe link placeholder",
          "Must work in Gmail, Outlook, and Apple Mail",
        ],
      },
    ],
  });

  // ───────────────────────────────
  // Block 5: Sentiment Analyzer
  // ───────────────────────────────
  await store.putBlock("adapter.sentiment_analysis", {
    description: "Text sentiment scoring adapter — analyzes text content and returns a sentiment score with detailed reasoning",
    inputs: [
      { name: "post", type: "entity.blog_post" },
    ],
    outputs: [
      {
        name: "result",
        type: "entity.score_result",
        semantics: ["score_0_1", "tone_quality"],
        constraints: [
          "Score must be between 0.0 (very negative) and 1.0 (very positive)",
          "Must provide specific reasoning referencing the input text",
          "Must identify matched positive and negative signals",
          "Must handle empty or very short content gracefully",
        ],
      },
    ],
  });

  await store.close();

  console.log("Registry seeded successfully:");
  console.log("  - 10 entities");
  console.log("  - 10 semantics");
  console.log("  - 5 philosophy statements");
  console.log("  - 3 global domain rules");
  console.log("  - 5 blocks:");
  console.log("    1. theme.modern_resume");
  console.log("    2. validator.blog_quality");
  console.log("    3. endpoint.user_api");
  console.log("    4. template.welcome_email");
  console.log("    5. adapter.sentiment_analysis");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
