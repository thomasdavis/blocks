# @blocksai/cli

Command-line interface for the Blocks validation framework.

[![npm version](https://img.shields.io/npm/v/@blocksai/cli.svg)](https://www.npmjs.com/package/@blocksai/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
# Install globally
npm install -g @blocksai/cli

# Or use with npx
npx @blocksai/cli init
```

## Commands

### `blocks init`

Initialize a new `blocks.yml` configuration file in your project:

```bash
blocks init
```

### `blocks run <block-name>`

Validate a single block:

```bash
blocks run my-block
```

### `blocks run --all`

Validate all blocks defined in your `blocks.yml`:

```bash
blocks run --all
```

## Configuration

The CLI reads configuration from `blocks.yml` in your project root. See the [main documentation](https://github.com/anthropics/blocks) for full configuration options.

### Environment Variables

Set your AI provider API key:

```bash
# OpenAI
export OPENAI_API_KEY=sk-...

# Anthropic
export ANTHROPIC_API_KEY=sk-ant-...

# Google
export GOOGLE_GENERATIVE_AI_API_KEY=...
```

Or use a `.env` file in your project root.

## Example

```bash
# Initialize a new project
blocks init

# Edit blocks.yml to define your blocks
# ...

# Validate a specific block
blocks run my-theme

# Validate all blocks
blocks run --all
```

## Output

The CLI provides colorful terminal output with:
- Progress spinners for long-running validations
- Color-coded results (green for success, red for errors, yellow for warnings)
- Actionable error messages with specific file locations

## Related Packages

- [@blocksai/schema](https://www.npmjs.com/package/@blocksai/schema) - Configuration parser
- [@blocksai/validators](https://www.npmjs.com/package/@blocksai/validators) - Validator implementations
- [@blocksai/ai](https://www.npmjs.com/package/@blocksai/ai) - AI provider abstraction
- [@blocksai/domain](https://www.npmjs.com/package/@blocksai/domain) - Domain modeling

## License

MIT
