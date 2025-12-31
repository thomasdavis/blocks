# Blocks Framework - Complete Claude Implementation Guide

This document provides comprehensive instructions for implementing the Blocks validation framework in any project. Blocks validates SOURCE CODE at development time using AI-powered semantic analysis.

---

## Table of Contents

1. [Installation](#installation)
2. [Project Structure](#project-structure)
3. [blocks.yml Configuration](#blocksyml-configuration)
4. [Creating Blocks](#creating-blocks)
5. [Built-in Validators](#built-in-validators)
6. [Custom Validators](#custom-validators)
7. [CLI Commands](#cli-commands)
8. [AI Provider Configuration](#ai-provider-configuration)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Installation

```bash
pnpm add @blocksai/cli @blocksai/validators
# or
npm install @blocksai/cli @blocksai/validators
```

**Required Environment Variable** (for AI-powered domain validation):
```bash
# Choose ONE provider:
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

---

## Project Structure

```
project/
├── blocks.yml                    # Configuration (REQUIRED)
├── adapters/                     # Block implementations (configurable via `root`)
│   ├── users/
│   │   ├── index.ts              # Exports (REQUIRED)
│   │   └── users.ts              # Implementation
│   └── products/
│       ├── index.ts
│       └── products.ts
├── validators/                   # Custom validators (OPTIONAL)
│   └── output/
│       ├── blocks-validator.ts   # Validator class
│       ├── rules.ts              # Validation rules
│       └── test-data.ts          # Test fixtures
└── data/                         # Test data (OPTIONAL)
    └── fixtures/
```

---

## blocks.yml Configuration

### Complete Schema Reference

```yaml
# ============================================
# ROOT-LEVEL FIELDS
# ============================================

name: "My Project"                # REQUIRED: Project identifier

root: "adapters"                  # OPTIONAL: Directory where blocks live
                                  # Default: "blocks"

philosophy:                       # OPTIONAL: Guides AI validation
  - "Blocks must be small and focused"
  - "Express domain intent clearly"
  - "Prefer explicit over implicit"

# ============================================
# DOMAIN MODEL (OPTIONAL)
# ============================================

domain:
  entities:                       # Core data types
    user:
      fields: [id, name, email, role]
    product:
      fields: [id, title, price, category]

  signals:                        # Concepts to extract/validate
    quality:
      description: "Quality score of output"
      extraction_hint: "Look for quality indicators"
    readability:
      description: "How readable is the output"
      extraction_hint: "Check typography, spacing, structure"

  measures:                       # Constraints on outputs
    valid_json:
      constraints:
        - "Output must be valid JSON"
        - "Must include all required fields"
    score_0_1:
      constraints:
        - "Score must be between 0.0 and 1.0"
        - "Score must have at most 2 decimal places"

# ============================================
# BLOCK DEFINITIONS (REQUIRED)
# ============================================

blocks:
  # Default domain rules (inherited by all blocks)
  domain_rules:
    - id: deterministic
      description: "Same input must produce same output"
    - id: no_side_effects
      description: "Must not modify external state"

  # Block definitions
  adapter.users:
    description: "Transforms raw user data"      # REQUIRED
    path: "adapters/users"                       # OPTIONAL: Custom path
    inputs:                                      # OPTIONAL
      - name: rawUser
        type: object
      - name: options
        type: object
        optional: true                           # Default: false
    outputs:                                     # OPTIONAL
      - name: user
        type: User
        measures: [valid_json]                   # Reference domain measures
        constraints:                             # Block-specific constraints
          - "Must include id, name, email"
    domain_rules:                                # OPTIONAL: Override inherited rules
      - id: custom_rule
        description: "Custom rule for this block only"
    test_data: "data/sample-user.json"          # OPTIONAL: Test fixture path

# ============================================
# VALIDATORS (OPTIONAL)
# ============================================

validators:                       # Default: ["domain"] if omitted
  - schema                        # Built-in: I/O signature validation
  - shape.ts                      # Built-in: File structure validation
  - domain                        # Built-in: AI semantic validation
  - name: output                  # Custom validator
    run: validators/output        # Path to validator module
    config:                       # Optional config passed to validator
      testDataPath: ./data

# ============================================
# AI CONFIGURATION (OPTIONAL)
# ============================================

ai:
  provider: "openai"              # Options: openai, anthropic, google
  model: "gpt-4o-mini"            # Provider-specific model name
```

### Provider Models

| Provider | Default Model | Alternatives |
|----------|---------------|--------------|
| openai | `gpt-4o-mini` | `gpt-4o`, `gpt-4-turbo` |
| anthropic | `claude-3-5-sonnet-20241022` | `claude-3-5-haiku-20241022` |
| google | `gemini-1.5-flash` | `gemini-1.5-pro` |

---

## Creating Blocks

### Step 1: Define in blocks.yml

```yaml
blocks:
  adapter.orders:
    description: "Calculates order totals from line items"
    inputs:
      - name: rawOrder
        type: RawOrder
    outputs:
      - name: order
        type: Order
        measures: [valid_total]
```

### Step 2: Create Directory Structure

```
adapters/
└── orders/
    ├── index.ts      # REQUIRED: Exports
    └── orders.ts     # Implementation
```

### Step 3: Implement the Block

**adapters/orders/index.ts:**
```typescript
export { calculateOrder as default, calculateOrder } from './orders';
export type { RawOrder, Order } from './orders';
```

**adapters/orders/orders.ts:**
```typescript
interface LineItem {
  productId: string;
  quantity: number;
  price: number;
}

interface RawOrder {
  id: string;
  items: LineItem[];
}

interface Order {
  id: string;
  items: LineItem[];
  total: number;
  status: 'pending' | 'confirmed';
}

export function calculateOrder(rawOrder: RawOrder): { order: Order } {
  const total = rawOrder.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return {
    order: {
      id: rawOrder.id,
      items: rawOrder.items,
      total,
      status: 'pending',
    }
  };
}
```

### Step 4: Validate

```bash
npx blocks run adapter.orders
```

---

## Built-in Validators

### 1. Schema Validator (`schema`)

**ID:** `schema.io`

**Purpose:** Validates input/output signatures match blocks.yml

**What It Checks:**
- Every input has `name` and `type` fields
- Every output has `name` and `type` fields
- Block has a description (info-level)

**Error Codes:**

| Code | Type | Meaning |
|------|------|---------|
| `INVALID_INPUT_SCHEMA` | error | Input missing name or type |
| `INVALID_OUTPUT_SCHEMA` | error | Output missing name or type |
| `MISSING_DESCRIPTION` | info | Block has no description |

---

### 2. Shape Validator (`shape.ts`)

**ID:** `shape.exports.ts`

**Purpose:** Validates TypeScript file structure and exports

**What It Checks:**
- Block path exists (file or directory)
- Contains TypeScript files (not just `.d.ts`)
- Has export statements

**Error Codes:**

| Code | Type | Meaning |
|------|------|---------|
| `INVALID_PATH` | error | Block path doesn't exist |
| `NO_TS_FILES` | error | No `.ts` files in directory |
| `NO_EXPORTS` | warning | No exports found |

---

### 3. Domain Validator (`domain`)

**ID:** `domain.validation`

**Purpose:** AI-powered semantic validation

**What It Checks:**
- Domain intent clarity in source code
- Correct input/output usage
- Domain rule compliance
- Philosophy alignment
- Template semantic HTML (if applicable)

**Process:**
1. Static analysis (fast, deterministic)
2. AI semantic analysis (reads ALL block files)

**Excluded from file reading:**
- `node_modules`, `dist`, `build`, `.git`, `.turbo`, `coverage`
- `.DS_Store`, `package-lock.json`, `pnpm-lock.yaml`

**Error Codes:**

| Code | Type | Meaning |
|------|------|---------|
| `MISSING_IMPLEMENTATION` | error | No files found in block |
| `DOMAIN_SEMANTIC_ISSUE` | error/warning | AI detected misalignment |
| `AI_VALIDATION_FAILED` | warning | AI call failed (non-blocking) |

---

## Custom Validators

### Implementation Pattern

**validators/output/blocks-validator.ts:**
```typescript
import type {
  Validator,
  ValidatorContext,
  ValidationResult,
  ValidationIssue
} from '@blocksai/validators';

export class OutputValidator implements Validator {
  id = "custom.output";

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    const { blockName, blockPath, config } = context;
    const issues: ValidationIssue[] = [];
    const rulesApplied: string[] = [];
    const filesAnalyzed: string[] = [];

    // Track what rules you're checking
    rulesApplied.push('score_range', 'has_required_fields');

    // Your validation logic
    try {
      // Example: Load and execute block with test data
      const testData = loadTestData();
      const result = await executeBlock(blockPath, testData);

      // Validate the result
      if (result.score < 0 || result.score > 1) {
        issues.push({
          type: 'error',
          code: 'SCORE_OUT_OF_RANGE',
          message: 'Score must be between 0 and 1',
          suggestion: `Got ${result.score}, expected 0.0-1.0`
        });
      }

      filesAnalyzed.push('test-data.json', blockPath);
    } catch (error) {
      issues.push({
        type: 'error',
        code: 'EXECUTION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return {
      valid: issues.filter(i => i.type === 'error').length === 0,
      issues,
      context: {
        filesAnalyzed,
        rulesApplied,
        summary: issues.length === 0
          ? 'All validations passed'
          : `Found ${issues.length} issue(s)`,
        input: { blockName, testData: 'loaded' },
        output: { checksPerformed: rulesApplied.length }
      }
    };
  }
}

export default OutputValidator;
```

### Register in blocks.yml

```yaml
validators:
  - schema
  - shape.ts
  - domain
  - name: output
    run: validators/output
    config:
      strict: true
```

### ValidationResult Interface

```typescript
interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  context?: {
    filesAnalyzed?: string[];
    rulesApplied?: string[];
    summary?: string;
    input?: any;
    output?: any;
  };
  ai?: {
    provider?: string;
    model?: string;
    prompt?: string;
    response?: string;
    tokensUsed?: { input: number; output: number };
  };
}

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  file?: string;
  line?: number;
  suggestion?: string;
}
```

---

## CLI Commands

### `blocks run`

Validate blocks against configured validators.

```bash
# Validate single block
npx blocks run adapter.users

# Validate all blocks
npx blocks run --all

# Custom config file
npx blocks run --all --config custom-blocks.yml

# JSON output
npx blocks run --all --json

# Save results to file
npx blocks run --all --output results.json
```

**Options:**

| Option | Description |
|--------|-------------|
| `--all` | Validate all blocks |
| `--config <path>` | Path to blocks.yml (default: `blocks.yml`) |
| `--json` | Output results as JSON |
| `--output <path>` | Save JSON results to file |

**Exit Codes:**
- `0` - All validations passed
- `1` - Any errors found (warnings don't fail)

### `blocks init`

Create a new blocks.yml configuration.

```bash
npx blocks init
npx blocks init --force  # Overwrite existing
```

### Output Storage

Results are automatically saved to `.blocks/runs/<timestamp>.json`

---

## AI Provider Configuration

### Environment Variables

```bash
# .env file
OPENAI_API_KEY=sk-proj-...
# OR
ANTHROPIC_API_KEY=sk-ant-...
# OR
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

### blocks.yml Configuration

```yaml
ai:
  provider: "anthropic"
  model: "claude-3-5-sonnet-20241022"
```

### How Domain Validation Works

1. **Collects all block files** recursively
2. **Builds prompt** with:
   - Project philosophy
   - Domain entities, signals, measures
   - Block definition from blocks.yml
   - All source files
   - Domain rules to check
3. **AI analyzes SOURCE CODE** (not runtime behavior)
4. **Returns structured result** with issues and summary

---

## Best Practices

### DO:

1. **Create blocks.yml first** - Define domain before writing code
2. **Keep blocks small** - One transformation per block
3. **Use descriptive names** - `adapter.user-profile` not `adapter.up`
4. **Define domain entities** - Helps AI understand intent
5. **Add philosophy** - Guides AI validation behavior
6. **Export from index.ts** - Both default and named exports
7. **Run validation frequently** - Catch issues early
8. **Use measures** - Define constraints on outputs

### DON'T:

1. **Don't skip index.ts** - Required for shape validation
2. **Don't put runtime validation in blocks** - Blocks validates source
3. **Don't ignore validation errors** - Fix before proceeding
4. **Don't use complex nested structures** - Keep blocks flat
5. **Don't hardcode paths** - Use `root` and `path` config

### Block Implementation Pattern

```typescript
// 1. Define types clearly
interface Input { ... }
interface Output { ... }

// 2. Export from index.ts
export { myBlock as default, myBlock } from './block';

// 3. Keep implementation pure
export function myBlock(input: Input): { output: Output } {
  // Transform input to output
  // No side effects
  // Deterministic
  return { output: result };
}
```

### Domain Rules Pattern

```yaml
blocks:
  # Inherited by all blocks
  domain_rules:
    - id: pure_function
      description: "Must be a pure function with no side effects"
    - id: type_safe
      description: "Must use TypeScript types for all inputs/outputs"

  # Override for specific block
  adapter.special:
    domain_rules:
      - id: special_rule
        description: "This block has different requirements"
```

---

## Troubleshooting

### "INVALID_PATH" Error

Block directory doesn't exist. Check:
- `root` setting in blocks.yml
- `path` setting for specific block
- Directory actually exists at expected location

### "NO_EXPORTS" Warning

TypeScript files have no exports. Ensure:
```typescript
// index.ts must have exports
export { myFunction } from './implementation';
export { myFunction as default } from './implementation';
```

### "AI_VALIDATION_FAILED" Warning

AI provider call failed. Check:
- Environment variable is set correctly
- API key is valid
- Network connectivity
- Rate limits not exceeded

### Validation Taking Too Long

Domain validator calls AI which can be slow:
- Use `gpt-4o-mini` or `gemini-1.5-flash` for faster validation
- Run specific blocks instead of `--all`
- Cache results in `.blocks/runs/`

### Custom Validator Not Loading

Ensure:
- File exports `default` or class named `Validator`/`OutputValidator`
- Path in `run` is correct (relative to project root)
- TypeScript is compiled if using `.ts` files

---

## Quick Reference

```bash
# Install
pnpm add @blocksai/cli @blocksai/validators

# Initialize
npx blocks init

# Validate
npx blocks run adapter.name    # Single block
npx blocks run --all           # All blocks
npx blocks run --all --json    # JSON output

# Environment
export OPENAI_API_KEY=sk-...
```

**Minimum blocks.yml:**
```yaml
name: my-project
root: adapters

blocks:
  adapter.example:
    description: "Example block"
    inputs:
      - name: input
        type: object
    outputs:
      - name: output
        type: object

validators:
  - schema
  - shape.ts
  - domain
```

---

## Links

- **Documentation:** https://blocks.thomasdavis.io
- **GitHub:** https://github.com/thomasdavis/blocks
- **npm:** https://www.npmjs.com/package/@blocksai/cli
