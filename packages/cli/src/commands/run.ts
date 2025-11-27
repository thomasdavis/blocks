import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { config as loadEnv } from "dotenv";
import { parseBlocksConfig } from "@blocksai/schema";
import { AIProvider } from "@blocksai/ai";
import { ValidatorRegistry } from "@blocksai/validators";

// Load environment variables from .env file in current directory
// Users can also set OPENAI_API_KEY in their shell environment
loadEnv();

export const runCommand = new Command("run")
  .description("Run validators against a block")
  .argument("[block-name]", "Name of the block to validate")
  .option("--all", "Run validators against all blocks")
  .option("--config <path>", "Path to blocks.yml", "blocks.yml")
  .action(async (blockName: string | undefined, options: { all?: boolean; config: string }) => {
    console.log(chalk.bold.blue("\n🧱 Blocks Validator\n"));

    // Load blocks.yml
    const configPath = options.config;
    if (!existsSync(configPath)) {
      console.error(chalk.red(`✗ Config file not found: ${configPath}`));
      process.exit(1);
    }

    const spinner = ora("Loading configuration...").start();
    let config;
    try {
      const yamlContent = readFileSync(configPath, "utf-8");
      config = parseBlocksConfig(yamlContent);
      spinner.succeed("Configuration loaded");
    } catch (error) {
      spinner.fail("Failed to parse configuration");
      console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
      process.exit(1);
    }

    // Determine which blocks to validate
    const blocksToValidate = options.all
      ? Object.keys(config.blocks).filter(key => key !== 'domain_rules')
      : blockName
        ? [blockName]
        : [];

    if (blocksToValidate.length === 0) {
      console.error(chalk.red("✗ No blocks specified. Use a block name or --all"));
      process.exit(1);
    }

    // Initialize AI provider from config or defaults
    const ai = new AIProvider({
      provider: config.ai?.provider,
      model: config.ai?.model,
    });

    // Run validators for each block
    for (const name of blocksToValidate) {
      console.log(chalk.bold(`\n📦 Validating: ${name}`));

      if (!config.blocks[name]) {
        console.error(chalk.red(`  ✗ Block "${name}" not found in config`));
        continue;
      }

      // Get block path - prioritize block.path, then config.root, then default to "blocks"
      const blockDef = config.blocks[name];
      let blockPath: string;

      if (blockDef.path) {
        // Use custom path from block definition
        blockPath = join(process.cwd(), blockDef.path);
      } else {
        // Fall back to root directory + block name
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

      // Create validator registry
      const registry = new ValidatorRegistry(config, ai);

      // Determine which validators to run (default to domain only)
      const validatorsToRun = config.validators ?? ["domain"];

      // Execute validators in order
      for (const validatorEntry of validatorsToRun) {
        let validatorId: string;
        let validatorLabel: string;

        if (typeof validatorEntry === "string") {
          // Built-in validator (short name)
          validatorId = validatorEntry;
          validatorLabel = validatorEntry;
        } else {
          // Custom validator (object with name + run)
          validatorId = validatorEntry.run;
          validatorLabel = validatorEntry.name;
        }

        const validator = registry.get(validatorId);
        if (!validator) {
          console.log(chalk.red(`  ✗ Unknown validator: ${validatorId}`));
          hasErrors = true;
          continue;
        }

        // Run validator (with spinner for slow ones)
        const needsSpinner = validatorId === "domain" || validatorId === "domain.validation";
        let spinner;

        if (needsSpinner) {
          spinner = ora(`  Running ${validatorLabel}...`).start();
        }

        try {
          const result = await validator.validate(context);

          if (spinner) spinner.stop();

          if (result.issues.length > 0) {
            for (const issue of result.issues) {
              const icon = issue.type === "error" ? "✗" : issue.type === "warning" ? "⚠" : "ℹ";
              const color =
                issue.type === "error" ? chalk.red : issue.type === "warning" ? chalk.yellow : chalk.blue;
              console.log(color(`  ${icon} [${validatorLabel}] ${issue.message}`));
              if (issue.suggestion) {
                console.log(chalk.gray(`    → ${issue.suggestion}`));
              }
              if (issue.type === "error") hasErrors = true;
              if (issue.type === "warning") hasWarnings = true;
            }
          } else {
            console.log(chalk.green(`  ✓ ${validatorLabel} ok`));
          }
        } catch (error) {
          if (spinner) spinner.fail(`${validatorLabel} failed`);
          console.error(
            chalk.red(`  Error: ${error instanceof Error ? error.message : "Unknown error"}`)
          );
          hasErrors = true;
        }
      }

      // Summary
      console.log();
      if (hasErrors) {
        console.log(chalk.red.bold(`  ❌ Block "${name}" has errors`));
      } else if (hasWarnings) {
        console.log(chalk.yellow.bold(`  ⚠️  Block "${name}" has warnings`));
      } else {
        console.log(chalk.green.bold(`  ✅ Block "${name}" passed all validations`));
      }
    }

    console.log();
  });
