# @blocksai/schema

Core schema definitions and `blocks.yml` parser for the Blocks validation framework.

[![npm version](https://img.shields.io/npm/v/@blocksai/schema.svg)](https://www.npmjs.com/package/@blocksai/schema)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @blocksai/schema
```

## Usage

### Parsing blocks.yml

```typescript
import { parseBlocksConfig } from '@blocksai/schema';
import fs from 'fs';

const yamlContent = fs.readFileSync('blocks.yml', 'utf-8');
const config = parseBlocksConfig(yamlContent);

console.log(config.name);        // Project name
console.log(config.blocks);      // Block definitions
console.log(config.validators);  // Validator configuration
```

### Validating Configuration

```typescript
import { validateBlocksConfig, isValidBlocksConfig } from '@blocksai/schema';

// Throws if invalid
const config = validateBlocksConfig(unknownData);

// Returns boolean
if (isValidBlocksConfig(data)) {
  // data is typed as BlocksConfig
}
```

## API

### `parseBlocksConfig(yamlContent: string): BlocksConfig`

Parse a YAML string into a validated `BlocksConfig` object.

### `validateBlocksConfig(config: unknown): BlocksConfig`

Validate an unknown object against the BlocksConfig schema. Throws `ZodError` if invalid.

### `isValidBlocksConfig(config: unknown): boolean`

Type guard that returns `true` if the config is valid.

## Schema (v2.0)

```typescript
interface BlocksConfig {
  $schema?: "blocks/v2";
  name: string;
  philosophy?: string[];
  domain?: {
    entities: Record<string, Entity>;
    semantics: Record<string, Semantic>;
  };
  blocks: Record<string, BlockDefinition>;
  validators?: Array<string | ValidatorConfig>;
  ai?: AIConfig;
  cache?: { path: string };
}

interface BlockDefinition {
  description: string;
  path?: string;
  inputs: Array<{ name: string; type: string }>;
  outputs: Array<{ name: string; type: string }>;
  skip_validators?: string[];
  exclude?: string[];
  validators?: Record<string, ValidatorConfig>;
}
```

## Dependencies

- [zod](https://www.npmjs.com/package/zod) - Schema validation
- [yaml](https://www.npmjs.com/package/yaml) - YAML parsing

## Related Packages

- [@blocksai/cli](https://www.npmjs.com/package/@blocksai/cli) - Command-line interface
- [@blocksai/validators](https://www.npmjs.com/package/@blocksai/validators) - Validator implementations
- [@blocksai/domain](https://www.npmjs.com/package/@blocksai/domain) - Domain modeling

## License

MIT
