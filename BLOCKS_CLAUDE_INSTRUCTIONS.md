# Blocks Framework - Claude Implementation Guide

Use this guide when implementing or working with the Blocks validation framework in this project.

---

## What is Blocks?

Blocks is a **development-time validation framework** that validates SOURCE CODE, not runtime behavior. It uses AI-powered semantic validation to ensure code aligns with domain rules.

**Key Principle:** If code passes validation during development, it will produce correct output at runtime. Blocks validates the source, not the execution.

---

## Installation

```bash
pnpm add @blocksai/cli @blocksai/validators
```

**Required Environment Variable** (for AI-powered domain validation):
```bash
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...
# OR
GOOGLE_GENERATIVE_AI_API_KEY=...
```

---

## Project Structure

When working with Blocks, follow this structure:

```
project/
├── blocks.yml              # Configuration (REQUIRED)
├── adapters/               # Block implementations (or custom root)
│   ├── block-name/
│   │   ├── index.ts        # Exports (REQUIRED)
│   │   └── block-name.ts   # Implementation
│   └── another-block/
│       ├── index.ts
│       └── another-block.ts
├── validators/             # Custom validators (OPTIONAL)
│   └── custom/
│       └── my-validator.ts
└── data/                   # Test fixtures (OPTIONAL)
```

---

## blocks.yml Configuration

Create `blocks.yml` in project root:

```yaml
name: project-name
root: adapters  # Directory containing blocks

# Domain concepts (helps AI understand intent)
domain:
  entities:
    entity_name:
      fields: [field1, field2, field3]

  signals:
    signal_name:
      description: "What this signal represents"
      extraction_hint: "How to identify it"

  measures:
    measure_name:
      constraints:
        - "Constraint description"

# Philosophy guides AI validation
philosophy:
  - "Keep blocks small and focused"
  - "Express domain intent clearly"
  - "Prefer explicit over implicit"

# Block definitions
blocks:
  adapter.name:
    description: "What this block does"
    inputs:
      - name: inputName
        type: InputType
    outputs:
      - name: outputName
        type: OutputType

# Validators (order matters - runs sequentially)
validators:
  - schema      # Fast: validates I/O matches blocks.yml
  - shape.ts    # Fast: validates file structure/exports
  - domain      # Slow: AI-powered semantic validation
```

---

## Creating a Block

### Step 1: Define in blocks.yml

```yaml
blocks:
  adapter.users:
    description: "Transforms raw user data to domain User"
    inputs:
      - name: rawUser
        type: RawUserData
    outputs:
      - name: user
        type: User
```

### Step 2: Create Implementation

**adapters/users/index.ts:**
```typescript
export { transformUser as default } from './users';
export { transformUser } from './users';
```

**adapters/users/users.ts:**
```typescript
interface RawUserData {
  id: string;
  full_name: string;
  email_address: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export function transformUser(rawUser: RawUserData): { user: User } {
  return {
    user: {
      id: rawUser.id,
      name: rawUser.full_name,
      email: rawUser.email_address,
    }
  };
}
```

### Step 3: Run Validation

```bash
npx blocks run adapter.users      # Single block
npx blocks run --all              # All blocks
```

---

## Built-in Validators

| Validator | Speed | Description |
|-----------|-------|-------------|
| `schema` | Fast | Validates inputs/outputs match blocks.yml definitions |
| `shape.ts` | Fast | Validates TypeScript files exist with proper exports |
| `domain` | Slow | AI analyzes source code for domain compliance |

---

## Custom Validators

Add custom validators to blocks.yml:

```yaml
validators:
  - schema
  - shape.ts
  - name: output
    run: validators/output/my-validator.ts
    config:
      testDataPath: ./data
```

**validators/output/my-validator.ts:**
```typescript
import { Validator, ValidatorContext, ValidationResult } from '@blocksai/validators';

export class MyValidator implements Validator {
  id = "custom.output";

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    const { blockName, blockPath, config } = context;

    // Your validation logic here
    const issues = [];

    // Example: load and test with real data
    // const testData = loadTestData(config.testDataPath);
    // const result = executeBlock(blockPath, testData);
    // if (!isValid(result)) issues.push({ type: 'error', message: '...' });

    return {
      valid: issues.length === 0,
      issues,
      context: {
        filesAnalyzed: ["file1.ts", "file2.ts"],
        rulesApplied: ["rule1", "rule2"],
        summary: "Validation passed/failed because...",
        input: { blockName, blockPath },
        output: { /* results */ }
      }
    };
  }
}

export default MyValidator;
```

---

## Validation Output Format

All validators return this structure:

```typescript
interface ValidationResult {
  valid: boolean;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    code?: string;
    message: string;
    file?: string;
    line?: number;
    suggestion?: string;
  }>;
  context?: {
    filesAnalyzed: string[];
    rulesApplied: string[];
    summary: string;
    input: any;
    output: any;
  };
  ai?: {
    model: string;
    prompt: string;
    response: string;
    tokensUsed: { input: number; output: number };
  };
}
```

---

## Claude Implementation Guidelines

When implementing blocks in this project:

### DO:
1. **Create blocks.yml first** - Define the domain before writing code
2. **Keep blocks small** - One transformation per block
3. **Use descriptive names** - `adapter.user-profile` not `adapter.up`
4. **Define domain entities** - Helps AI understand intent
5. **Run validation frequently** - `npx blocks run --all`
6. **Export from index.ts** - Both default and named exports

### DON'T:
1. **Don't skip index.ts** - Required for validation
2. **Don't put runtime validation in blocks** - Blocks validates source code
3. **Don't ignore validation errors** - Fix before proceeding
4. **Don't use complex nested structures** - Keep blocks flat and simple

### When Adding a New Block:
1. Add definition to `blocks.yml`
2. Create directory: `adapters/{block-name}/`
3. Create `index.ts` with exports
4. Create implementation file
5. Run `npx blocks run {block-name}`
6. Fix any validation issues

### When Validation Fails:
1. Read the error message and summary
2. Check `filesAnalyzed` to see what was examined
3. Check `rulesApplied` to understand what was checked
4. Look at `context.output` for detailed results
5. Fix the issue in source code
6. Re-run validation

---

## Example: Complete Block Implementation

**blocks.yml:**
```yaml
name: my-app
root: adapters

domain:
  entities:
    order:
      fields: [id, items, total, status]
    line_item:
      fields: [productId, quantity, price]

  measures:
    valid_total:
      constraints:
        - "Total must equal sum of line item prices"

blocks:
  adapter.orders:
    description: "Calculates order totals from line items"
    inputs:
      - name: rawOrder
        type: RawOrder
    outputs:
      - name: order
        type: Order

validators:
  - schema
  - shape.ts
  - domain
```

**adapters/orders/index.ts:**
```typescript
export { calculateOrder as default, calculateOrder } from './orders';
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

**Run:**
```bash
npx blocks run adapter.orders
```

---

## Links

- Documentation: https://blocks.thomasdavis.io
- GitHub: https://github.com/thomasdavis/blocks
- npm: https://www.npmjs.com/package/@blocksai/cli
