import { Command } from "commander";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { runCommand } from "./commands/run.js";
import { initCommand } from "./commands/init.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf-8")
);

const program = new Command();

program
  .name("blocks")
  .description("CLI for Blocks - Domain-driven code validation and orchestration")
  .version(packageJson.version);

program.addCommand(runCommand);
program.addCommand(initCommand);

program.parse(process.argv);
