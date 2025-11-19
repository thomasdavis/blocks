import { Command } from "commander";
import chalk from "chalk";
import { writeFileSync } from "fs";

const exampleConfig = `project:
  name: "My Blocks Project"
  domain: "myproject.general"

philosophy:
  - "Blocks must be small, composable, deterministic."
  - "Blocks must express domain intent clearly in code."
  - "All blocks must validate through multi-layer checks."

domain:
  entities:
    user:
      fields: [id, name, email]

  signals:
    user_engagement:
      description: "How engaged is the user?"
      extraction_hint: "Look for login frequency, feature usage."

  measures:
    score_0_1:
      constraints:
        - "Value must be between 0 and 1."

blocks:
  example_block:
    description: "An example block"
    inputs:
      - name: user
        type: entity.user
    outputs:
      - name: score
        type: measure.score_0_1

validators:
  schema:
    - id: io_schema
      run: "schema.io.v1"

  shape:
    - id: export_shape
      run: "shape.exports.v1"

  domain:
    - id: domain_alignment
      run: "domain.validation.v1"

pipeline:
  name: "default"
  steps:
    - id: schema
      run: "schema.io.v1"
    - id: shape
      run: "shape.exports.v1"
    - id: domain
      run: "domain.validation.v1"

agent:
  mode: "block_builder"
  rules:
    - "Always read blocks.yml before creating or modifying code."
    - "Always run blocks CLI after changes."
    - "Always interpret validator output as instructions."

targets:
  kind: "block"
  discover:
    root: "."
`;

export const initCommand = new Command("init")
  .description("Initialize a new blocks.yml configuration")
  .option("-f, --force", "Overwrite existing blocks.yml")
  .action((options: { force?: boolean }) => {
    try {
      writeFileSync("blocks.yml", exampleConfig, { flag: options.force ? "w" : "wx" });
      console.log(chalk.green("✓ Created blocks.yml"));
      console.log(chalk.gray("\nNext steps:"));
      console.log(chalk.gray("  1. Edit blocks.yml to define your domain"));
      console.log(chalk.gray("  2. Create blocks in the blocks/ directory"));
      console.log(chalk.gray("  3. Run: blocks run <block-name>"));
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "EEXIST") {
        console.error(chalk.red("✗ blocks.yml already exists. Use --force to overwrite."));
        process.exit(1);
      }
      throw error;
    }
  });
