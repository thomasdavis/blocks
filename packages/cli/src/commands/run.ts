import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";
import { config as loadEnv } from "dotenv";
import { parseBlocksConfig } from "@blocksai/schema";
import { AIProvider } from "@blocksai/ai";
import { ValidatorRegistry, type Validator } from "@blocksai/validators";
import type {
  ValidationRunOutput,
  BlockRunResult,
  ValidatorRunResult,
  RunCommandOptions,
} from "../types.js";

// Load environment variables from .env file in current directory
loadEnv();

const RUNS_DIR = ".blocks/runs";
const MAX_RUNS = 50;

/**
 * Dynamically load a custom validator from a local path
 * Supports paths like "validators/output" which resolves to:
 * - dist/validators/output/blocks-validator.js (compiled TypeScript)
 * - validators/output/blocks-validator.js (if already JS)
 */
async function loadCustomValidator(validatorPath: string): Promise<Validator | null> {
  // Try different file patterns, preferring compiled dist files
  const patterns = [
    // Compiled TypeScript output in dist/
    join(process.cwd(), "dist", validatorPath, "blocks-validator.js"),
    join(process.cwd(), "dist", validatorPath, "index.js"),
    join(process.cwd(), "dist", `${validatorPath}.js`),
    // Direct path (for JS projects or when running with ts-node/tsx)
    join(process.cwd(), validatorPath, "blocks-validator.js"),
    join(process.cwd(), validatorPath, "blocks-validator.ts"),
    join(process.cwd(), validatorPath, "index.js"),
    join(process.cwd(), validatorPath, "index.ts"),
    join(process.cwd(), `${validatorPath}.js`),
    join(process.cwd(), `${validatorPath}.ts`),
  ];

  for (const filePath of patterns) {
    if (existsSync(filePath)) {
      try {
        const fileUrl = pathToFileURL(filePath).href;
        const module = await import(fileUrl);

        // Look for default export or named Validator export
        const ValidatorClass = module.default || module.OutputValidator || module.Validator;

        if (ValidatorClass && typeof ValidatorClass === "function") {
          return new ValidatorClass();
        }
      } catch (error) {
        // Continue to next pattern
      }
    }
  }

  return null;
}

/**
 * Generate a unique run ID based on timestamp
 */
function generateRunId(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

/**
 * Save run output to .blocks/runs/ directory
 */
function saveRun(output: ValidationRunOutput, customPath?: string): string {
  const filePath = customPath || join(process.cwd(), RUNS_DIR, `${output.id}.json`);

  // Ensure directory exists
  const dir = customPath ? join(filePath, "..") : join(process.cwd(), RUNS_DIR);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(filePath, JSON.stringify(output, null, 2));

  // Clean up old runs (keep only MAX_RUNS most recent)
  if (!customPath) {
    cleanupOldRuns();
  }

  return filePath;
}

/**
 * Remove old run files, keeping only the most recent MAX_RUNS
 */
function cleanupOldRuns(): void {
  const runsPath = join(process.cwd(), RUNS_DIR);
  if (!existsSync(runsPath)) return;

  try {
    const files = readdirSync(runsPath)
      .filter((f) => f.endsWith(".json"))
      .sort()
      .reverse();

    // Delete files beyond MAX_RUNS
    for (const file of files.slice(MAX_RUNS)) {
      unlinkSync(join(runsPath, file));
    }
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Print colored console output (original behavior)
 */
function printColoredOutput(output: ValidationRunOutput): void {
  console.log(chalk.bold.blue("\n🧱 Blocks Validator\n"));

  for (const block of output.blocks) {
    console.log(chalk.bold(`\n📦 Validating: ${block.blockName}`));

    for (const validator of block.validators) {
      if (validator.issues.length > 0) {
        for (const issue of validator.issues) {
          const icon = issue.type === "error" ? "✗" : issue.type === "warning" ? "⚠" : "ℹ";
          const color =
            issue.type === "error" ? chalk.red : issue.type === "warning" ? chalk.yellow : chalk.blue;
          console.log(color(`  ${icon} [${validator.label}] ${issue.message}`));
          if (issue.suggestion) {
            console.log(chalk.gray(`    → ${issue.suggestion}`));
          }
        }
      } else {
        console.log(chalk.green(`  ✓ ${validator.label} ok`));
      }
    }

    // Block summary
    console.log();
    if (block.hasErrors) {
      console.log(chalk.red.bold(`  ❌ Block "${block.blockName}" has errors`));
    } else if (block.hasWarnings) {
      console.log(chalk.yellow.bold(`  ⚠️  Block "${block.blockName}" has warnings`));
    } else {
      console.log(chalk.green.bold(`  ✅ Block "${block.blockName}" passed all validations`));
    }
  }

  console.log();
}

export const runCommand = new Command("run")
  .description("Run validators against a block")
  .argument("[block-name]", "Name of the block to validate")
  .option("--all", "Run validators against all blocks")
  .option("--config <path>", "Path to blocks.yml", "blocks.yml")
  .option("--json", "Output results as JSON")
  .option("--output <path>", "Write JSON results to file (implies --json)")
  .action(async (blockName: string | undefined, options: RunCommandOptions) => {
    const isJsonMode = options.json || options.output;
    const startTime = Date.now();

    // Load blocks.yml
    const configPath = options.config;
    if (!existsSync(configPath)) {
      if (isJsonMode) {
        console.error(JSON.stringify({ error: `Config file not found: ${configPath}` }));
      } else {
        console.log(chalk.bold.blue("\n🧱 Blocks Validator\n"));
        console.error(chalk.red(`✗ Config file not found: ${configPath}`));
      }
      process.exit(1);
    }

    let spinner: ReturnType<typeof ora> | undefined;
    if (!isJsonMode) {
      console.log(chalk.bold.blue("\n🧱 Blocks Validator\n"));
      spinner = ora("Loading configuration...").start();
    }

    let config;
    try {
      const yamlContent = readFileSync(configPath, "utf-8");
      config = parseBlocksConfig(yamlContent);
      if (!isJsonMode) spinner?.succeed("Configuration loaded");
    } catch (error) {
      if (!isJsonMode) {
        spinner?.fail("Failed to parse configuration");
        console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
      } else {
        console.error(
          JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" })
        );
      }
      process.exit(1);
    }

    // Determine which blocks to validate
    const blocksToValidate = options.all
      ? Object.keys(config.blocks).filter((key) => key !== "domain_rules")
      : blockName
        ? [blockName]
        : [];

    if (blocksToValidate.length === 0) {
      if (isJsonMode) {
        console.error(JSON.stringify({ error: "No blocks specified. Use a block name or --all" }));
      } else {
        console.error(chalk.red("✗ No blocks specified. Use a block name or --all"));
      }
      process.exit(1);
    }

    // Initialize AI provider from config or defaults
    const ai = new AIProvider({
      provider: config.ai?.provider,
      model: config.ai?.model,
    });

    // Collect results
    const runId = generateRunId();
    const blockResults: BlockRunResult[] = [];
    let totalPassed = 0;
    let totalFailed = 0;
    let totalWarnings = 0;

    // Run validators for each block
    for (const name of blocksToValidate) {
      if (!isJsonMode) {
        console.log(chalk.bold(`\n📦 Validating: ${name}`));
      }

      if (!config.blocks[name]) {
        if (!isJsonMode) {
          console.error(chalk.red(`  ✗ Block "${name}" not found in config`));
        }
        blockResults.push({
          blockName: name,
          blockPath: "",
          hasErrors: true,
          hasWarnings: false,
          validators: [
            {
              id: "config",
              label: "config",
              passed: false,
              duration: 0,
              issues: [
                {
                  type: "error",
                  code: "BLOCK_NOT_FOUND",
                  message: `Block "${name}" not found in config`,
                },
              ],
            },
          ],
        });
        totalFailed++;
        continue;
      }

      // Get block path
      const blockDef = config.blocks[name];
      let blockPath: string;

      if (blockDef.path) {
        blockPath = join(process.cwd(), blockDef.path);
      } else {
        const blocksRoot = config.root || "blocks";
        blockPath = join(process.cwd(), blocksRoot, name);
      }

      const context = {
        blockName: name,
        blockPath,
        config,
      };

      let hasErrors = false;
      let hasWarnings = false;
      const validatorResults: ValidatorRunResult[] = [];

      // Create validator registry
      const registry = new ValidatorRegistry(config, ai);

      // Determine which validators to run (default to domain only)
      const validatorsToRun = config.validators ?? ["domain"];

      // Execute validators in order
      for (const validatorEntry of validatorsToRun) {
        let validatorId: string;
        let validatorLabel: string;

        if (typeof validatorEntry === "string") {
          validatorId = validatorEntry;
          validatorLabel = validatorEntry;
        } else {
          validatorId = validatorEntry.run;
          validatorLabel = validatorEntry.name;
        }

        let validator = registry.get(validatorId);

        // If not a built-in validator, try loading as custom validator
        if (!validator && typeof validatorEntry === "object" && validatorEntry.run) {
          validator = await loadCustomValidator(validatorEntry.run);
        }

        if (!validator) {
          validatorResults.push({
            id: validatorId,
            label: validatorLabel,
            passed: false,
            duration: 0,
            issues: [
              {
                type: "error",
                code: "UNKNOWN_VALIDATOR",
                message: `Unknown validator: ${validatorId}`,
              },
            ],
          });
          hasErrors = true;
          if (!isJsonMode) {
            console.log(chalk.red(`  ✗ Unknown validator: ${validatorId}`));
          }
          continue;
        }

        // Run validator (with spinner for slow ones in non-JSON mode)
        const needsSpinner =
          !isJsonMode && (validatorId === "domain" || validatorId === "domain.validation");
        let validatorSpinner: ReturnType<typeof ora> | undefined;

        if (needsSpinner) {
          validatorSpinner = ora(`  Running ${validatorLabel}...`).start();
        }

        const validatorStart = Date.now();

        try {
          const result = await validator.validate(context);
          const duration = Date.now() - validatorStart;

          if (validatorSpinner) validatorSpinner.stop();

          const passed = result.issues.filter((i) => i.type === "error").length === 0;
          const hasValidatorWarnings = result.issues.some((i) => i.type === "warning");

          validatorResults.push({
            id: validator.id,
            label: validatorLabel,
            passed,
            duration,
            issues: result.issues,
            context: result.context,
            ai: result.ai,
          });

          if (!passed) hasErrors = true;
          if (hasValidatorWarnings) hasWarnings = true;

          // Print output in non-JSON mode
          if (!isJsonMode) {
            if (result.issues.length > 0) {
              for (const issue of result.issues) {
                const icon = issue.type === "error" ? "✗" : issue.type === "warning" ? "⚠" : "ℹ";
                const color =
                  issue.type === "error"
                    ? chalk.red
                    : issue.type === "warning"
                      ? chalk.yellow
                      : chalk.blue;
                console.log(color(`  ${icon} [${validatorLabel}] ${issue.message}`));
                if (issue.suggestion) {
                  console.log(chalk.gray(`    → ${issue.suggestion}`));
                }
              }
            } else {
              console.log(chalk.green(`  ✓ ${validatorLabel} ok`));
            }
          }
        } catch (error) {
          const duration = Date.now() - validatorStart;
          if (validatorSpinner) validatorSpinner.fail(`${validatorLabel} failed`);

          validatorResults.push({
            id: validatorId,
            label: validatorLabel,
            passed: false,
            duration,
            issues: [
              {
                type: "error",
                code: "VALIDATOR_ERROR",
                message: error instanceof Error ? error.message : "Unknown error",
              },
            ],
          });
          hasErrors = true;

          if (!isJsonMode) {
            console.error(
              chalk.red(`  Error: ${error instanceof Error ? error.message : "Unknown error"}`)
            );
          }
        }
      }

      // Block summary
      if (!isJsonMode) {
        console.log();
        if (hasErrors) {
          console.log(chalk.red.bold(`  ❌ Block "${name}" has errors`));
        } else if (hasWarnings) {
          console.log(chalk.yellow.bold(`  ⚠️  Block "${name}" has warnings`));
        } else {
          console.log(chalk.green.bold(`  ✅ Block "${name}" passed all validations`));
        }
      }

      blockResults.push({
        blockName: name,
        blockPath,
        hasErrors,
        hasWarnings,
        validators: validatorResults,
      });

      if (hasErrors) {
        totalFailed++;
      } else if (hasWarnings) {
        totalWarnings++;
      } else {
        totalPassed++;
      }
    }

    // Build output object
    const output: ValidationRunOutput = {
      version: "1.0",
      id: runId,
      timestamp: new Date().toISOString(),
      configPath,
      projectName: config.name || "Unknown",
      duration: Date.now() - startTime,
      summary: {
        totalBlocks: blocksToValidate.length,
        passed: totalPassed,
        failed: totalFailed,
        warnings: totalWarnings,
      },
      blocks: blockResults,
    };

    // Save run to .blocks/runs/ (always, for devtools history)
    try {
      saveRun(output, options.output);
    } catch {
      // Ignore save errors, don't fail the command
    }

    // Output based on mode
    if (isJsonMode) {
      console.log(JSON.stringify(output, null, 2));
    } else {
      console.log();
    }

    // Exit with appropriate code
    if (totalFailed > 0) {
      process.exit(1);
    }
  });
