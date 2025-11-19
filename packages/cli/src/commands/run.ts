import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { parseBlocksConfig } from "@blocksai/schema";
import { AIProvider } from "@blocksai/ai";
import { IOSchemaValidator, ExportsShapeValidator, DomainValidator } from "@blocksai/validators";

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
      ? Object.keys(config.blocks)
      : blockName
        ? [blockName]
        : [];

    if (blocksToValidate.length === 0) {
      console.error(chalk.red("✗ No blocks specified. Use a block name or --all"));
      process.exit(1);
    }

    // Initialize AI provider
    const ai = new AIProvider();

    // Run validators for each block
    for (const name of blocksToValidate) {
      console.log(chalk.bold(`\n📦 Validating: ${name}`));

      if (!config.blocks[name]) {
        console.error(chalk.red(`  ✗ Block "${name}" not found in config`));
        continue;
      }

      const blockPath = join(process.cwd(), "blocks", name);

      const context = {
        blockName: name,
        blockPath,
        config,
      };

      let hasErrors = false;
      let hasWarnings = false;

      // Schema validation
      const schemaValidator = new IOSchemaValidator();
      const schemaResult = await schemaValidator.validate(context);
      if (schemaResult.issues.length > 0) {
        for (const issue of schemaResult.issues) {
          const icon = issue.type === "error" ? "✗" : issue.type === "warning" ? "⚠" : "ℹ";
          const color =
            issue.type === "error" ? chalk.red : issue.type === "warning" ? chalk.yellow : chalk.blue;
          console.log(color(`  ${icon} [schema] ${issue.message}`));
          if (issue.suggestion) {
            console.log(chalk.gray(`    → ${issue.suggestion}`));
          }
          if (issue.type === "error") hasErrors = true;
          if (issue.type === "warning") hasWarnings = true;
        }
      } else {
        console.log(chalk.green("  ✓ schema ok"));
      }

      // Shape validation
      const shapeValidator = new ExportsShapeValidator();
      const shapeResult = await shapeValidator.validate(context);
      if (shapeResult.issues.length > 0) {
        for (const issue of shapeResult.issues) {
          const icon = issue.type === "error" ? "✗" : issue.type === "warning" ? "⚠" : "ℹ";
          const color =
            issue.type === "error" ? chalk.red : issue.type === "warning" ? chalk.yellow : chalk.blue;
          console.log(color(`  ${icon} [shape] ${issue.message}`));
          if (issue.suggestion) {
            console.log(chalk.gray(`    → ${issue.suggestion}`));
          }
          if (issue.type === "error") hasErrors = true;
          if (issue.type === "warning") hasWarnings = true;
        }
      } else {
        console.log(chalk.green("  ✓ shape ok"));
      }

      // Domain validation (only if files exist)
      if (existsSync(blockPath)) {
        const domainValidator = new DomainValidator(config, ai);
        const domainSpinner = ora("  Running domain validation...").start();
        try {
          const domainResult = await domainValidator.validate(context);
          domainSpinner.stop();

          if (domainResult.issues.length > 0) {
            for (const issue of domainResult.issues) {
              const icon = issue.type === "error" ? "✗" : issue.type === "warning" ? "⚠" : "ℹ";
              const color =
                issue.type === "error"
                  ? chalk.red
                  : issue.type === "warning"
                    ? chalk.yellow
                    : chalk.blue;
              console.log(color(`  ${icon} [domain] ${issue.message}`));
              if (issue.suggestion) {
                console.log(chalk.gray(`    → ${issue.suggestion}`));
              }
              if (issue.type === "error") hasErrors = true;
              if (issue.type === "warning") hasWarnings = true;
            }
          } else {
            console.log(chalk.green("  ✓ domain ok"));
          }
        } catch (error) {
          domainSpinner.fail("Domain validation failed");
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
