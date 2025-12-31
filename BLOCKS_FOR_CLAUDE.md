# Using Blocks with Claude

This document explains how to use Blocks for development-time validation in your project.

## What is Blocks?

Blocks is a framework for **development-time semantic validation**. It validates your SOURCE CODE during development, not runtime behavior. The key insight: if a template passes validation during development, it will ALWAYS produce correct output at runtime.

## Quick Start

### 1. Install

```bash
npm install @blocksai/cli @blocksai/validators
# or
pnpm add @blocksai/cli @blocksai/validators
```

### 2. Create `blocks.yml`

Create a `blocks.yml` file in your project root:

```yaml
name: my-project
root: adapters  # Directory where blocks live

# Optional: Define your domain concepts
domain:
  entities:
    user:
      fields: [id, name, email]
    product:
      fields: [id, title, price]

  signals:
    quality:
      description: "Quality score of output"
      extraction_hint: "Look for quality indicators"

  measures:
    valid_output:
      constraints:
        - "Output must be valid JSON"

# Define your blocks (adapters/transformers)
blocks:
  adapter.users:
    description: "Transforms user data"
    inputs:
      - name: rawUser
        type: object
    outputs:
      - name: user
        type: User

  adapter.products:
    description: "Transforms product data"
    inputs:
      - name: rawProduct
        type: object
    outputs:
      - name: product
        type: Product

# Validators to run (order matters)
validators:
  - schema      # Validates input/output schemas
  - shape.ts    # Validates TypeScript file structure
  - domain      # AI-powered semantic validation
```

### 3. Create Block Implementation

Each block lives in its own directory under `root`. For example `adapters/users/`:

```
adapters/
├── users/
│   ├── index.ts      # Exports
│   └── users.ts      # Implementation
├── products/
│   ├── index.ts
│   └── products.ts
```

**adapters/users/index.ts:**
```typescript
export { transformUser as default } from './users';
```

**adapters/users/users.ts:**
```typescript
interface RawUser {
  id: string;
  full_name: string;
  email_address: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export function transformUser(rawUser: RawUser): { user: User } {
  return {
    user: {
      id: rawUser.id,
      name: rawUser.full_name,
      email: rawUser.email_address,
    }
  };
}
```

### 4. Run Validation

```bash
npx blocks run adapter.users      # Validate single block
npx blocks run --all              # Validate all blocks
```

## Environment Variables

For AI-powered domain validation, set one of:

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

## Validators

### Built-in Validators

| Validator | Description |
|-----------|-------------|
| `schema` | Validates input/output match blocks.yml |
| `shape.ts` | Validates TypeScript file structure and exports |
| `domain` | AI-powered semantic validation against domain rules |

### Custom Validators

You can create custom validators:

```yaml
validators:
  - schema
  - shape.ts
  - name: output
    run: validators/output/blocks-validator.ts
    config:
      testDataPath: ./data
```

Custom validator structure:
```typescript
import { Validator, ValidatorContext, ValidationResult } from '@blocksai/validators';

export class MyValidator implements Validator {
  id = "custom.my-validator";

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    // Your validation logic
    return {
      valid: true,
      issues: [],
      context: {
        filesAnalyzed: ["file1.ts"],
        rulesApplied: ["rule1", "rule2"],
        summary: "Validation passed",
        input: { /* what was validated */ },
        output: { /* validation results */ }
      }
    };
  }
}
```

## Best Practices

1. **Keep blocks small and focused** - Each block should do one thing well
2. **Define clear domain concepts** - Entities, signals, and measures help AI understand intent
3. **Use descriptive names** - Block names should indicate their purpose
4. **Add philosophy** - Top-level `philosophy` field guides AI validation:

```yaml
philosophy:
  - "Blocks must be small, composable, deterministic"
  - "Express domain intent clearly in code"
  - "Prefer explicit over implicit transformations"
```

## Validation Output

Validators return rich context for debugging:

```json
{
  "valid": true,
  "issues": [],
  "context": {
    "filesAnalyzed": ["users.ts", "index.ts"],
    "rulesApplied": ["has_exports", "valid_typescript", "matches_schema"],
    "summary": "Shape validation passed. Analyzed 2 TypeScript file(s) with 2 total export(s)",
    "input": { "blockPath": "adapters/users" },
    "output": { "exportCount": 2, "exports": ["default", "transformUser"] }
  }
}
```

## Example Project Structure

```
my-project/
├── blocks.yml
├── adapters/
│   ├── users/
│   │   ├── index.ts
│   │   └── users.ts
│   ├── products/
│   │   ├── index.ts
│   │   └── products.ts
│   └── orders/
│       ├── index.ts
│       └── orders.ts
├── validators/           # Optional custom validators
│   └── output/
│       └── my-validator.ts
└── data/                 # Optional test data
    └── fixtures/
```

## Links

- Documentation: https://blocks.thomasdavis.io
- GitHub: https://github.com/thomasdavis/blocks
- npm: https://www.npmjs.com/package/@blocksai/cli
