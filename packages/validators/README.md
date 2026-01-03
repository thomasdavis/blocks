# @blocksai/validators

Core validator implementations for the Blocks framework.

[![npm version](https://img.shields.io/npm/v/@blocksai/validators.svg)](https://www.npmjs.com/package/@blocksai/validators)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @blocksai/validators
```

## Built-in Validators

### Schema Validator (`schema` / `schema.io`)

Validates that block input/output signatures match the `blocks.yml` configuration.

**Checks:**
- All inputs have `name` and `type`
- All outputs have `name` and `type`
- Types match declarations

**Error Codes:**
- `INVALID_INPUT_SCHEMA`
- `INVALID_OUTPUT_SCHEMA`

### Shape Validator (`shape.ts` / `shape.exports.ts`)

Validates block file structure.

**Checks:**
- `index.ts` exists with exports
- `block.ts` exists

**Error Codes:**
- `MISSING_FILE`
- `NO_EXPORTS`

### Domain Validator (`domain` / `domain.validation`)

AI-powered semantic validation that checks domain compliance.

**Features:**
- Reads ALL files in block directory recursively
- Performs static analysis first (fast)
- Falls back to AI for semantic checks
- Respects `exclude` patterns

**Error Codes:**
- `DOMAIN_SEMANTIC_ISSUE`
- `AI_VALIDATION_FAILED`

## Usage

### Using the Validator Registry

```typescript
import { ValidatorRegistry } from '@blocksai/validators';
import { parseBlocksConfig } from '@blocksai/schema';
import { AIProvider } from '@blocksai/ai';

const config = parseBlocksConfig(yamlContent);
const ai = new AIProvider(config.ai);
const registry = new ValidatorRegistry(config, ai);

// Get a validator by name
const schemaValidator = registry.get('schema');
const domainValidator = registry.get('domain');

// Run validation
const context = {
  blockName: 'my-block',
  blockPath: '/path/to/block',
  config
};

const result = await schemaValidator.validate(context);
console.log(result.valid);   // true/false
console.log(result.issues);  // ValidationIssue[]
```

### Creating Custom Validators

```typescript
import { Validator, ValidatorContext, ValidationResult } from '@blocksai/validators';

class MyCustomValidator implements Validator {
  id = 'custom.my-validator';

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    const issues = [];

    // Your validation logic here

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// Register with the registry
registry.register(new MyCustomValidator());
```

## Validator Interface

```typescript
interface Validator {
  id: string;
  validate(context: ValidatorContext): Promise<ValidationResult>;
}

interface ValidatorContext {
  blockName: string;
  blockPath: string;
  config: BlocksConfig;
}

interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

interface ValidationIssue {
  type: 'error' | 'warning';
  code: string;
  message: string;
  file?: string;
  line?: number;
}
```

## Configuration

Configure validators in `blocks.yml`:

```yaml
validators:
  - schema              # Short name
  - shape.ts            # Short name
  - name: domain        # With config
    config:
      rules:
        - id: semantic_html
          description: "Use semantic HTML"
```

### Skip Validators Per Block

```yaml
blocks:
  my-block:
    skip_validators:
      - domain
```

### Exclude Files from Validation

```yaml
blocks:
  my-block:
    exclude:
      - "*.test.ts"
      - "__tests__/**"
```

## Related Packages

- [@blocksai/cli](https://www.npmjs.com/package/@blocksai/cli) - Command-line interface
- [@blocksai/schema](https://www.npmjs.com/package/@blocksai/schema) - Configuration parser
- [@blocksai/domain](https://www.npmjs.com/package/@blocksai/domain) - Domain modeling
- [@blocksai/ai](https://www.npmjs.com/package/@blocksai/ai) - AI provider abstraction

## License

MIT
