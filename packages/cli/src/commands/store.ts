import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { readFileSync, existsSync } from "fs";
import { parseBlocksConfig } from "@blocksai/schema";
import { BlocksStore } from "@blocksai/store";
import { config as loadEnv } from "dotenv";

loadEnv();

export const storeCommand = new Command("store")
  .description("Manage database-backed block storage");

storeCommand
  .command("init")
  .description("Initialize database schema at the given URL")
  .argument("<url>", "Database URL (sqlite:///path/to/file.db or postgres://...)")
  .action(async (url: string) => {
    const spinner = ora("Initializing database...").start();
    try {
      const store = new BlocksStore(url);
      await store.initialize();
      await store.close();
      spinner.succeed("Database schema initialized");
      console.log(chalk.gray(`  URL: ${url}`));
    } catch (error) {
      spinner.fail("Failed to initialize database");
      console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
      process.exit(1);
    }
  });

storeCommand
  .command("push")
  .description("Push local blocks.yml configuration to a database")
  .argument("<url>", "Database URL")
  .option("--config <path>", "Path to blocks.yml", "blocks.yml")
  .action(async (url: string, options: { config: string }) => {
    const configPath = options.config;
    if (!existsSync(configPath)) {
      console.error(chalk.red(`✗ Config file not found: ${configPath}`));
      process.exit(1);
    }

    const spinner = ora("Pushing configuration to database...").start();
    try {
      const yamlContent = readFileSync(configPath, "utf-8");
      const config = parseBlocksConfig(yamlContent);

      const store = new BlocksStore(url);
      await store.initialize();
      await store.fromBlocksConfig(config);
      await store.close();

      spinner.succeed("Configuration pushed to database");
      console.log(chalk.gray(`  Blocks: ${Object.keys(config.blocks).length}`));
      console.log(chalk.gray(`  Entities: ${Object.keys(config.domain?.entities || {}).length}`));
      console.log(chalk.gray(`  Semantics: ${Object.keys(config.domain?.semantics || {}).length}`));
    } catch (error) {
      spinner.fail("Failed to push configuration");
      console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
      process.exit(1);
    }
  });

storeCommand
  .command("pull")
  .description("Pull configuration from a database and display it")
  .argument("<url>", "Database URL")
  .option("--json", "Output as JSON instead of YAML")
  .action(async (url: string, options: { json?: boolean }) => {
    const spinner = ora("Pulling configuration from database...").start();
    try {
      const store = new BlocksStore(url);
      await store.initialize();
      const config = await store.toBlocksConfig();
      await store.close();

      spinner.succeed("Configuration pulled from database");

      if (options.json) {
        console.log(JSON.stringify(config, null, 2));
      } else {
        console.log(chalk.bold("\nProject:"), config.name);
        console.log(chalk.bold("Blocks:"), Object.keys(config.blocks).join(", ") || "(none)");
        if (config.domain?.entities) {
          console.log(chalk.bold("Entities:"), Object.keys(config.domain.entities).join(", "));
        }
        if (config.domain?.semantics) {
          console.log(chalk.bold("Semantics:"), Object.keys(config.domain.semantics).join(", "));
        }
        if (config.philosophy?.length) {
          console.log(chalk.bold("Philosophy:"), `${config.philosophy.length} statement(s)`);
        }
      }
    } catch (error) {
      spinner.fail("Failed to pull configuration");
      console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
      process.exit(1);
    }
  });
