import { Command } from "commander";
import chalk from "chalk";
import { writeFileSync } from "fs";

const exampleConfig = `# Blocks Configuration
# Domain: Define your project's semantic domain model

name: "My Blocks Project"
root: "blocks"  # Default directory for blocks

# AI Configuration (optional)
# Defaults to OpenAI gpt-4o-mini if not specified
ai:
  provider: "openai"  # Options: openai, anthropic, google
  model: "gpt-4o-mini"  # OpenAI: gpt-4o-mini, gpt-4o | Anthropic: claude-3-5-sonnet-20241022 | Google: gemini-1.5-flash

# Philosophy statements guide AI validation
philosophy:
  - "Blocks must be small, composable, and deterministic"
  - "Express domain intent clearly in code"
  - "Validate at development time, trust at runtime"

# Domain semantics
domain:
  entities:
    user:
      description: "A user in the system"
      fields:
        - id
        - name
        - email

    result:
      description: "Result of a computation"
      fields:
        - value
        - score

  signals:
    user_engagement:
      description: "Measures how engaged a user is with the system"
      extraction_hint: "Look for login frequency, feature usage, interaction patterns"

  measures:
    score_0_1:
      constraints:
        - "Value must be between 0 and 1"
        - "Must be a valid number"

# Block definitions
blocks:
  # Default domain rules for all blocks
  domain_rules:
    - id: clear_intent
      description: "Block implementation must clearly express domain intent"
    - id: proper_validation
      description: "Validate inputs appropriately for the domain"

  example_block:
    type: function
    description: "Example block that computes user engagement score"
    path: "blocks/example-block"
    inputs:
      - name: user
        type: entity.user
        description: "User to analyze"
    outputs:
      - name: result
        type: entity.result
        measures: [score_0_1]
        constraints:
          - "Must return valid engagement score"
    # Inherits blocks.domain_rules automatically

# Validators (optional - defaults to domain only)
# Uncomment to customize validation pipeline:
# validators:
#   - schema     # Validate blocks.yml structure
#   - shape.ts   # Validate TypeScript file structure
#   - domain     # Validate semantic alignment (recommended)
`;

export const initCommand = new Command("init")
  .description("Initialize a new blocks.yml configuration")
  .option("-f, --force", "Overwrite existing blocks.yml")
  .action((options: { force?: boolean }) => {
    try {
      writeFileSync("blocks.yml", exampleConfig, { flag: options.force ? "w" : "wx" });
      console.log(chalk.green("✓ Created blocks.yml"));
      console.log(chalk.gray("\nNext steps:"));
      console.log(chalk.gray("  1. Set your API key: export OPENAI_API_KEY=sk-..."));
      console.log(chalk.gray("  2. Edit blocks.yml to define your domain entities and rules"));
      console.log(chalk.gray("  3. Create blocks in the blocks/ directory"));
      console.log(chalk.gray("  4. Run: blocks run example_block"));
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "EEXIST") {
        console.error(chalk.red("✗ blocks.yml already exists. Use --force to overwrite."));
        process.exit(1);
      }
      throw error;
    }
  });
