import { spawnSync } from "child_process";
import { readFileSync, unlinkSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";
import { config as dotenvConfig } from "dotenv";
import { AIProvider } from "@blocksai/ai";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from repo root
const rootDir = join(__dirname, "..");
dotenvConfig({ path: join(rootDir, ".env") });

const THRESHOLD = 0.6;

interface ExpectedOutcome {
  shouldPass: boolean;
  expectedIssuePatterns: Array<{
    code: string;
    type?: "error" | "warning";
    messageContains?: string;
  }>;
}

interface ExpectedOutcomes {
  blocks: Record<string, ExpectedOutcome>;
}

async function main() {
  const rootDir = join(__dirname, "..");
  const fixturesPath = join(rootDir, "packages/examples/test-fixtures");
  const expectedPath = join(fixturesPath, "expected-outcomes.json");

  console.log("=== CLI Integration Test ===\n");
  console.log(`Fixtures path: ${fixturesPath}`);
  console.log(`Running CLI validation...\n`);

  // 1. Run CLI and capture JSON output to a temp file
  const outputFile = join(tmpdir(), `blocks-cli-output-${Date.now()}.json`);

  const result = spawnSync(
    "node",
    [
      "packages/cli/dist/index.js",
      "run",
      "--all",
      "--json",
      "--force",
      "--config",
      `${fixturesPath}/blocks.yml`,
      "--output",
      outputFile,
    ],
    {
      cwd: rootDir,
      env: { ...process.env },
      encoding: "utf-8",
      stdio: "inherit", // Pass through stdout/stderr
    }
  );

  if (result.error) {
    console.error("CLI execution failed:", result.error);
    process.exit(1);
  }

  // Read the output file
  if (!existsSync(outputFile)) {
    console.error("CLI did not create output file:", outputFile);
    console.error("CLI status:", result.status);
    process.exit(1);
  }

  const cliOutput = readFileSync(outputFile, "utf-8");

  // Clean up temp file
  try {
    unlinkSync(outputFile);
  } catch {
    // Ignore cleanup errors
  }

  let actual: unknown;
  try {
    // The output file contains pure JSON
    actual = JSON.parse(cliOutput);
  } catch (parseError) {
    console.error("Failed to parse CLI output as JSON:");
    console.error("Parse error:", parseError);
    console.error("Output tail:", cliOutput.slice(-500));
    process.exit(1);
  }

  const expected: ExpectedOutcomes = JSON.parse(
    readFileSync(expectedPath, "utf-8")
  );

  console.log("CLI output received. Evaluating with AI...\n");

  // 2. Use AI to evaluate alignment
  const ai = new AIProvider({ provider: "openai", model: "gpt-4o-mini" });

  const EvaluationSchema = z.object({
    alignmentScore: z.number().min(0).max(1),
    reasoning: z.string(),
    blockResults: z.array(
      z.object({
        blockName: z.string(),
        expectedPass: z.boolean(),
        actualPass: z.boolean(),
        expectedIssuesFound: z.boolean(),
        notes: z.string(),
      })
    ),
  });

  const evaluation = await ai.generateStructured({
    schema: EvaluationSchema,
    prompt: `Compare the expected CLI validation outcomes with actual results.

EXPECTED OUTCOMES:
${JSON.stringify(expected, null, 2)}

ACTUAL CLI OUTPUT:
${JSON.stringify(actual, null, 2)}

For each block in the expected outcomes, check:
1. Does shouldPass match whether the block actually passed (hasErrors === false)?
2. If expectedIssuePatterns are specified, were those issues found in the actual output?
   - Match by 'code' field
   - If 'messageContains' is specified, check if any issue message contains that text
   - If 'type' is specified, verify the issue type matches
3. Calculate an overall alignment score (0-1) based on how well actual matches expected.

Be lenient with AI-generated issue messages - they don't need to match exactly,
just semantically align with expectedIssuePatterns.

Important:
- A block passes (shouldPass: true) if hasErrors is false
- A block fails (shouldPass: false) if hasErrors is true
- Warnings don't cause a block to fail`,
    system:
      "You are evaluating CLI test results. Focus on whether the validation behavior matches expectations. Be precise about pass/fail status matching.",
  });

  // 3. Report results
  console.log("=== CLI Integration Test Results ===\n");
  console.log(
    `Alignment Score: ${(evaluation.alignmentScore * 100).toFixed(1)}%`
  );
  console.log(`Threshold: ${THRESHOLD * 100}%`);
  console.log(
    `Status: ${evaluation.alignmentScore >= THRESHOLD ? "PASS" : "FAIL"}\n`
  );

  console.log("Block Results:");
  for (const block of evaluation.blockResults) {
    const passMatch = block.expectedPass === block.actualPass;
    const issuesMatch = block.expectedIssuesFound;
    const status = passMatch && issuesMatch ? "\u2713" : "\u2717";
    console.log(`  ${status} ${block.blockName}: ${block.notes}`);
  }

  console.log(`\nReasoning: ${evaluation.reasoning}`);

  // 4. Exit with appropriate code
  if (evaluation.alignmentScore >= THRESHOLD) {
    console.log("\n\u2705 CLI Integration Test PASSED");
    process.exit(0);
  } else {
    console.log("\n\u274C CLI Integration Test FAILED");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Evaluation failed:", err);
  process.exit(1);
});
