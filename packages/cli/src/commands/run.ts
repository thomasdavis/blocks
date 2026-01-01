import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";
import { config as loadEnv } from "dotenv";
import pLimit from "p-limit";
import { parseBlocksConfig } from "@blocksai/schema";
import { AIProvider } from "@blocksai/ai";
import { ValidatorRegistry, type Validator } from "@blocksai/validators";
import type {
  ValidationRunOutput,
  BlockRunResult,
  ValidatorRunResult,
  RunCommandOptions,
} from "../types.js";
import {
  CacheManager,
  SkipLogic,
  computeContentHash,
  type BlockCacheEntry,
  type CachedValidatorResult,
} from "../cache/index.js";

// Load environment variables from .env file in current directory
loadEnv();

const RUNS_DIR = ".blocks/runs";
const MAX_RUNS = 50;

// Estimated time for domain validation (for time saved calculation)
const ESTIMATED_DOMAIN_VALIDATION_MS = 500;

/**
 * Dynamically load a custom validator from a local path
 * Supports paths like "validators/output" which resolves to:
 * - dist/validators/output/blocks-validator.js (compiled TypeScript)
 * - validators/output/blocks-validator.js (if already JS)
 */
async function loadCustomValidator(validatorPath: string): Promise<Validator | undefined> {
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

  return undefined;
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
  .option("-c, --concurrency <number>", "Number of validators to run in parallel", "1")
  .option("--force", "Force full validation, ignore cache")
  .option("--no-cache", "Disable caching (don't read or write cache)")
  .action(async (blockName: string | undefined, options: RunCommandOptions) => {
    const concurrency = Math.max(1, parseInt(String(options.concurrency), 10) || 1);
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
    let yamlContent: string;
    try {
      yamlContent = readFileSync(configPath, "utf-8");
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

    // Initialize cache manager
    // Commander.js --no-cache sets options.cache to false
    const cacheDisabled = options.cache === false;
    const forceMode = options.force === true;
    const cacheManager = new CacheManager(process.cwd(), cacheDisabled);
    cacheManager.initializeCache(config, yamlContent);

    // Initialize skip logic
    const skipLogic = new SkipLogic(cacheManager, config, yamlContent, forceMode);

    // Show global changes summary if any
    if (!isJsonMode && !cacheDisabled) {
      const globalSummary = skipLogic.getGlobalChangesSummary();
      if (globalSummary) {
        console.log(chalk.yellow(`  Cache: ${globalSummary}`));
      }
    }

    // Determine which blocks to validate
    // v2.0: No more domain_rules at block level - all keys are block definitions
    const blocksToValidate = options.all
      ? Object.keys(config.blocks)
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

    // Prune deleted blocks from cache
    cacheManager.pruneDeletedBlocks(blocksToValidate);

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
    let totalValidatorsSkipped = 0;
    let totalValidatorsRun = 0;

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

      // blockDef could be an array (for domain_rules) or a block definition object
      if (Array.isArray(blockDef)) {
        // This shouldn't happen since we filter out domain_rules
        continue;
      }

      if (blockDef.path) {
        blockPath = join(process.cwd(), blockDef.path);
      } else {
        // v2.0: No more 'root' field - default to ./blocks/ directory
        blockPath = join(process.cwd(), "blocks", name);
      }

      const context = {
        blockName: name,
        blockPath,
        config,
        concurrency,
      };

      let hasErrors = false;
      let hasWarnings = false;
      const validatorResults: ValidatorRunResult[] = [];

      // Create validator registry
      const registry = new ValidatorRegistry(config, ai);

      // Determine which validators to run (default to domain only)
      const validatorsToRun = config.validators ?? ["domain"];

      // Get validator IDs for cache decision
      // For custom validators, use the name (e.g., "output") not the run path (e.g., "validators/output")
      // since the name maps to the validator's internal ID via VALIDATOR_ID_MAP
      const validatorIds = validatorsToRun.map((v) =>
        typeof v === "string" ? v : v.name
      );

      // Get cache decision for this block
      const cacheDecision = skipLogic.decideBlock(name, blockPath, validatorIds);

      // Show cache decision in non-JSON mode
      if (!isJsonMode && !cacheDisabled) {
        console.log(chalk.gray(`  Cache: ${cacheDecision.summary}`));
      }

      // Create concurrency limiter
      const limit = pLimit(concurrency);

      // Show spinner for parallel execution in non-JSON mode
      const isParallel = concurrency > 1;
      let blockSpinner: ReturnType<typeof ora> | undefined;
      if (!isJsonMode && isParallel) {
        const runCount = cacheDecision.validators.filter((v) => v.shouldRun).length;
        if (runCount > 0) {
          blockSpinner = ora(`  Running ${runCount} validators (concurrency: ${concurrency})...`).start();
        }
      }

      // Prepare validator tasks
      const validatorTasks = validatorsToRun.map((validatorEntry, index) => {
        return limit(async (): Promise<ValidatorRunResult> => {
          let validatorId: string;
          let validatorLabel: string;
          let validatorRunPath: string | undefined;

          if (typeof validatorEntry === "string") {
            validatorId = validatorEntry;
            validatorLabel = validatorEntry;
          } else {
            // Use name for cache lookup, run for loading custom validator
            validatorId = validatorEntry.name;
            validatorRunPath = validatorEntry.run;
            validatorLabel = validatorEntry.name;
          }

          // Check if we should skip this validator
          const decision = cacheDecision.validators.find(
            (v) => v.validatorId === validatorId
          );

          if (decision && !decision.shouldRun && decision.cachedResult) {
            // Use cached result
            totalValidatorsSkipped++;
            return {
              id: validatorId,
              label: validatorLabel,
              passed: decision.cachedResult.passed,
              duration: 0,
              issues: decision.cachedResult.issues?.map((i) => ({
                type: i.type as "error" | "warning" | "info",
                code: i.code,
                message: i.message,
              })) || [],
              skipped: true,
              skipReason: decision.reason.type === "cached"
                ? (decision.reason as { message: string }).message
                : "Cached",
            };
          }

          totalValidatorsRun++;

          let validator = registry.get(validatorId);

          // If not a built-in validator, try loading as custom validator
          if (!validator && validatorRunPath) {
            validator = await loadCustomValidator(validatorRunPath);
          }

          if (!validator) {
            return {
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
            };
          }

          // Run validator (with spinner for slow ones in non-JSON mode, only for sequential execution)
          const needsSpinner =
            !isJsonMode && !isParallel && (validatorId === "domain" || validatorId === "domain.validation");
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

            return {
              id: validator.id,
              label: validatorLabel,
              passed,
              duration,
              issues: result.issues,
              context: result.context,
              ai: result.ai,
            };
          } catch (error) {
            const duration = Date.now() - validatorStart;
            if (validatorSpinner) validatorSpinner.fail(`${validatorLabel} failed`);

            return {
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
            };
          }
        });
      });

      // Execute all validator tasks with concurrency limit
      const results = await Promise.all(validatorTasks);

      // Stop block spinner if running
      if (blockSpinner) blockSpinner.stop();

      // Process results and print output
      for (const result of results) {
        validatorResults.push(result);

        if (!result.passed) hasErrors = true;
        if (result.issues.some((i) => i.type === "warning")) hasWarnings = true;

        // Print output in non-JSON mode
        if (!isJsonMode) {
          if (result.skipped) {
            console.log(chalk.gray(`  ⏭ [${result.label}] cached`));
          } else if (result.issues.length > 0) {
            for (const issue of result.issues) {
              const icon = issue.type === "error" ? "✗" : issue.type === "warning" ? "⚠" : "ℹ";
              const color =
                issue.type === "error"
                  ? chalk.red
                  : issue.type === "warning"
                    ? chalk.yellow
                    : chalk.blue;
              console.log(color(`  ${icon} [${result.label}] ${issue.message}`));
              if (issue.suggestion) {
                console.log(chalk.gray(`    → ${issue.suggestion}`));
              }
            }
          } else {
            console.log(chalk.green(`  ✓ ${result.label} ok`));
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

      // Update cache with results
      if (!cacheDisabled) {
        const cacheEntry: BlockCacheEntry = {
          blockName: name,
          blockPath,
          files: cacheDecision.currentFiles,
          contentHash: cacheDecision.currentContentHash,
          configHash: skipLogic.getNewFingerprint().blockConfigs[name]?.definitionHash || "",
          lastValidated: new Date().toISOString(),
          lastRunId: runId,
          validatorResults: {},
        };

        // Store results for validators that were actually run
        for (const result of validatorResults) {
          if (!result.skipped) {
            cacheEntry.validatorResults[result.id] = {
              passed: result.passed,
              hash: cacheDecision.currentContentHash,
              issues: result.issues.map((i) => ({
                type: i.type,
                code: i.code,
                message: i.message,
              })),
            };
          } else {
            // Preserve cached results
            const existingEntry = cacheManager.getBlockEntry(name);
            const existingResult = existingEntry?.validatorResults[result.id];
            if (existingResult) {
              cacheEntry.validatorResults[result.id] = existingResult;
            }
          }
        }

        cacheManager.updateBlockEntry(cacheEntry);
      }

      const skippedCount = validatorResults.filter((v) => v.skipped).length;

      blockResults.push({
        blockName: name,
        blockPath,
        hasErrors,
        hasWarnings,
        validators: validatorResults,
        cache: !cacheDisabled ? {
          decision: cacheDecision.summary,
          skippedValidators: skippedCount,
          revalidationReason: cacheDecision.validators.find((v) => v.shouldRun)?.reason.type,
        } : undefined,
      });

      if (hasErrors) {
        totalFailed++;
      } else if (hasWarnings) {
        totalWarnings++;
      } else {
        totalPassed++;
      }
    }

    // Save cache
    if (!cacheDisabled) {
      cacheManager.updateConfigFingerprint(skipLogic.getNewFingerprint());
      cacheManager.save();
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
        cached: !cacheDisabled ? {
          validatorsSkipped: totalValidatorsSkipped,
          validatorsRun: totalValidatorsRun,
          timeSavedMs: totalValidatorsSkipped * ESTIMATED_DOMAIN_VALIDATION_MS,
        } : undefined,
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
      // Show cache summary
      if (!cacheDisabled && totalValidatorsSkipped > 0) {
        console.log(
          chalk.cyan(
            `\n  Cache: ${totalValidatorsSkipped} validator(s) skipped, ~${(totalValidatorsSkipped * ESTIMATED_DOMAIN_VALIDATION_MS / 1000).toFixed(1)}s saved`
          )
        );
      }
      console.log();
    }

    // Exit with appropriate code
    if (totalFailed > 0) {
      process.exit(1);
    }
  });
