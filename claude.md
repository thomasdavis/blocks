# Blocks Internal Development Guide

This document is for developers working on the Blocks framework itself (core packages, validators, CLI).

## Project Architecture

### Monorepo Structure

```
blocks/
├── packages/
│   ├── cli/                # @blocksai/cli - CLI interface
│   ├── schema/             # @blocksai/schema - blocks.yml parser
│   ├── domain/             # @blocksai/domain - Domain modeling
│   ├── validators/         # @blocksai/validators - Core validators
│   ├── ai/                 # @blocksai/ai - AI provider abstraction
│   └── visual-validators/  # @blocksai/visual-validators - Screenshot + vision
├── apps/
│   └── docs/               # Documentation site (Fumadocs + Next.js)
├── examples/               # Example projects for testing patterns
│   ├── json-resume-themes/
│   └── blog-content-validator/
└── docs/                   # Static documentation
```

### Build System

- **Package Manager:** pnpm 9.15.0
- **Build Tool:** Turborepo (monorepo orchestration)
- **Compiler:** tsup (TypeScript bundler)
- **Runtime:** Node.js >=20.0.0

### Dependencies

All packages use Vercel AI SDK v6 for LLM abstraction:
- `@ai-sdk/openai` - OpenAI provider
- `@ai-sdk/anthropic` - Anthropic Claude
- `@ai-sdk/google` - Google Gemini
- `ai` - Vercel AI SDK core

## Core Principle: Development-Time Validation

**CRITICAL:** Blocks validates SOURCE CODE at development time, NOT runtime behavior.

### Why This Matters

Templates are deterministic:
```
Same input → Same template → Same output
```

If `template.hbs` passes validation during development, it will ALWAYS produce correct output at runtime.

**Consequence:**
- Block implementations stay simple (~20 lines)
- All semantic validation happens at development time
- Domain validator reads ALL source files, not just implementations
- No runtime parsing of output to check domain rules

### Development-Time vs Runtime

**Development-Time (Blocks' Domain):**
- Validate SOURCE CODE during development
- AI analyzes template files, implementation files, all block files
- Provide semantic feedback to guide iterative improvement
- Goal: Ensure code is correct BEFORE deployment

**Runtime (Application Layer):**
- Validate INPUT DATA only (required fields, valid formats)
- NO validation of template compliance
- NO parsing of output to check domain rules
- Trust that validated source code produces correct output

## Package Details

### @blocksai/schema

**Purpose:** Parse and validate blocks.yml configuration

**Key Files:**
- `types.ts` (229 lines) - Zod schemas for entire blocks.yml structure
- `parser.ts` (26 lines) - YAML parsing functions

**Schema Structure:**
```typescript
BlocksConfigSchema = {
  project: { name, domain }
  philosophy?: string[]
  domain?: {
    entities: Record<string, { fields: string[] }>
    signals: Record<string, { description, extraction_hint? }>
    measures: Record<string, { constraints: string[] }>
  }
  blocks: Record<string, BlockDefinition>
  validators?: ValidatorConfig
  pipeline?: Pipeline
  agent?: Agent
  targets?: Targets
}
```

**Exports:**
```typescript
parseBlocksConfig(yamlContent: string): BlocksConfig
validateBlocksConfig(config: unknown): BlocksConfig
isValidBlocksConfig(config: unknown): boolean
```

### @blocksai/domain

**Purpose:** Domain semantics modeling and static analysis

**Key Files:**
- `registry.ts` (123 lines) - Central domain configuration registry
- `analyzer.ts` (127 lines) - Static domain compliance checking

**DomainRegistry Methods:**
```typescript
getEntities(): Record<string, Entity>
getSignals(): Record<string, Signal>
getMeasures(): Record<string, Measure>
getBlock(name: string): BlockDefinition | undefined
getDomainRules(blockName?: string): DomainRule[]
getPhilosophy(): string[]
```

**DomainAnalyzer Methods:**
```typescript
analyzeBlock(blockName: string): AnalysisResult
detectDrift(): DriftReport
```

**Architecture Note:** This package provides deterministic validation without AI - fast checks before slow AI validation.

### @blocksai/ai

**Purpose:** Multi-provider AI abstraction for semantic validation

**Key File:** `provider.ts` (~300 lines)

**Supported Providers:**
- OpenAI (gpt-4o-mini, gpt-4o)
- Anthropic (claude-3-5-sonnet, claude-3-5-haiku)
- Google (gemini-1.5-flash, gemini-1.5-pro)

**Key Methods:**
```typescript
generateStructured<T>(prompt: string, schema: ZodSchema<T>): Promise<T>
generateText(prompt: string): Promise<string>
validateDomainSemantics(context: DomainContext): Promise<ValidationResult>
detectLanguage(text: string): Promise<string>
scoreQuality(text: string, criteria: string): Promise<number>
validateVisualSemantics(screenshots: Screenshot[], config: VisualConfig): Promise<VisualIssue[]>
```

**Configuration:**
- Reads API keys from environment variables automatically
- Falls back to config object if provided
- Uses Vercel AI SDK v6 for universal provider interface

### @blocksai/validators

**Purpose:** Core validation implementations

**Three Validator Types:**

#### 1. Schema Validator (`schema/io-validator.ts`)
- Validates input/output signatures match blocks.yml
- Fast, deterministic
- Checks: all inputs/outputs have name and type
- Error codes: `INVALID_INPUT_SCHEMA`, `INVALID_OUTPUT_SCHEMA`

#### 2. Shape Validator (`shape/exports-validator.ts`)
- Validates file structure
- Fast, filesystem-based
- Checks: `index.ts` and `block.ts` exist, exports present
- Error codes: `MISSING_FILE`, `NO_EXPORTS`

#### 3. Domain Validator (`domain/domain-validator.ts`)
- AI-powered semantic validation
- Reads ALL files in block directory recursively
- Excludes: node_modules, dist, build, .git, .turbo, coverage
- Performs static analysis first (uses @blocksai/domain)
- Falls back to AI for semantic checks
- Falls back to warning on AI failures
- Error codes: `DOMAIN_SEMANTIC_ISSUE`, `AI_VALIDATION_FAILED`

**Common Interface:**
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
```

### @blocksai/visual-validators

**Purpose:** Visual validation using screenshots and AI vision

**Components:**

#### ScreenshotCapture (`screenshot/capture.ts`)
- Uses Playwright to capture HTML screenshots
- Supports multiple viewports simultaneously
- Browser initialization, capture, cleanup

#### AxeValidator (`axe/axe-validator.ts`)
- Deterministic WCAG accessibility checking
- Uses axe-core library
- Fast, precise A11y compliance

#### VisionValidator (`vision/vision-validator.ts`)
- AI-powered visual analysis with GPT-4o
- Analyzes screenshots for:
  - Color contrast and readability
  - Visual hierarchy and flow
  - Layout integrity across viewports
  - Element visibility and spacing
- Complements AxeValidator (AI + deterministic)

**Types:**
```typescript
interface Viewport {
  width: number;
  height: number;
  name: string;
}

interface Screenshot {
  buffer: Buffer;
  viewport: Viewport;
}

interface VisualIssue {
  type: 'error' | 'warning';
  code: string;
  message: string;
  suggestion?: string;
  viewport?: string;
}
```

### @blocksai/cli

**Purpose:** Command-line interface

**Commands:**
- `blocks init` - Initialize blocks.yml
- `blocks run [block-name]` - Validate single block
- `blocks run --all` - Validate all blocks

**Key Implementation Details:**
- Loads .env file for API keys
- Determines block path: `block.path` → `targets.discover.root` → "blocks"
- Creates context object: `{ blockName, blockPath, config }`
- Runs validators in sequence: schema → shape → domain
- Colored output with Chalk, spinners with Ora
- Exits with error code if validation fails

**run.ts Flow:**
```typescript
1. Load blocks.yml (parseBlocksConfig)
2. Initialize AI provider from config
3. For each block:
   a. Determine block path (custom or default)
   b. Create validator context
   c. Run schema validator
   d. Run shape validator
   e. Run domain validator (with spinner)
   f. Aggregate issues
   g. Print colored output
4. Exit with error code if any errors
```

## Key Architectural Decisions

### Domain Validator Reads ALL Files

The domain validator reads **every file in the block directory** recursively.

**Why:**
- AI needs complete context (templates, styles, utilities, everything)
- Works with any project organization
- AI understands how files relate holistically
- Future-proof for blocks with multiple components

**Implementation:**
```typescript
function readAllBlockFiles(blockPath: string): Record<string, string> {
  // Recursively read all files
  // Exclude: node_modules, dist, build, .git, .turbo, coverage
  // Return: { "path/file.ts": "content", "template.hbs": "content" }
}
```

### Block Path Resolution (Flexible)

**Priority:**
1. `block.path` in blocks.yml - Custom path
2. `targets.discover.root` + blockName - Configured root
3. Default "blocks" directory

**Why:** Users can organize projects however they want. Respect their structure.

### Default Domain Rules (DRY)

**Schema Support:**
```yaml
blocks:
  domain_rules:  # Inherited by all blocks
    - id: semantic_html
      description: "..."

  theme.modern:
    description: "..."
    # Inherits defaults

  theme.creative:
    domain_rules:  # Overrides defaults completely
      - id: creative_freedom
        description: "..."
```

**Inheritance Logic:**
- If block omits `domain_rules`: inherits `blocks.domain_rules`
- If block defines `domain_rules`: overrides completely (explicit beats implicit)

### AI Validation Context

When domain validator calls AI, it passes:

1. **Project Philosophy** - from `philosophy` field
2. **Domain Concepts** - entities, signals, measures
3. **ALL Block Files** - complete source code
4. **Domain Rules** - default + block-specific
5. **Validation Instructions** - what to check

**Prompt Structure:**
```
Project Philosophy:
- "Blocks must be small, composable, deterministic."
- "Express domain intent clearly in code."

Domain Concepts:
- Entities: resume, user, theme_config
- Signals: readability, engagement
- Measures: valid_html, score_0_1

Domain Rules:
- Must use semantic HTML tags
- Must include ARIA labels

ALL Block Files:
--- block.ts ---
[full source]

--- template.hbs ---
[full template]

--- index.ts ---
[exports]

Instructions:
Analyze ALL files together. Check if:
1. Expresses domain intent clearly
2. Uses specified inputs/outputs correctly
3. Adheres to all domain rules
4. For templates: Check SOURCE for semantic HTML
5. Does NOT introduce undocumented concepts

Return specific, actionable issues.
```

## Development Workflow

### Building Locally

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run CLI locally
cd packages/cli
pnpm build
node dist/index.js init
```

### Testing Changes

```bash
# Test on example projects
cd examples/json-resume-themes
blocks run theme.modern_professional

cd examples/blog-content-validator
blocks run post.good
```

### Adding a New Validator

1. Create validator class in `packages/validators/src/<type>/`
2. Implement `Validator` interface
3. Export from package
4. Add to CLI's validator pipeline in `packages/cli/src/commands/run.ts`

**Example:**
```typescript
// packages/validators/src/lint/eslint-validator.ts
import { Validator, ValidatorContext, ValidationResult } from '../types';

export class ESLintValidator implements Validator {
  id = "lint.eslint.v1";

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    // Your validation logic
    return {
      valid: true,
      issues: []
    };
  }
}
```

### Publishing

Uses Changesets for versioning:

```bash
# Create changeset
pnpm changeset

# Version packages
pnpm changeset version

# Publish to npm
pnpm changeset publish
```

## Common Mistakes to Avoid

### ❌ Runtime Validation in Block Implementations

```typescript
// DON'T do this in blocks
export function theme(resume: Resume) {
  const html = template(resume);
  if (!html.includes('<header>')) throw new Error(...);
  return { html };
}
```

**Why wrong:** Template is deterministic. If it passes dev-time validation, it's correct. This is what validators do, not blocks.

### ❌ Validating Only block.ts

```typescript
// In domain validator - DON'T do this
const code = readFileSync(join(blockPath, 'block.ts'), 'utf-8');
await ai.validate({ code });  // ❌ Missing template!
```

**Why wrong:** Need ALL files for complete context.

### ❌ Hardcoding Folder Structure

```typescript
// DON'T do this
const blockPath = join('blocks', blockName);  // ❌ Ignores path field
```

**Why wrong:** Users can customize with `path` field in blocks.yml.

### ❌ Not Handling AI Failures Gracefully

```typescript
// DON'T do this
const result = await ai.validateDomainSemantics(context);
// Crash if AI fails
```

**Why wrong:** AI can be flaky (rate limits, timeouts). Fall back to warnings, not errors.

## Success Patterns

### ✅ Read All Files in Validator

```typescript
const blockFiles = readAllBlockFiles(context.blockPath);
await ai.validateDomainSemantics({
  files: blockFiles,  // ✓ All files
  philosophy: context.config.philosophy,
  domainRules,
});
```

### ✅ Respect Custom Paths

```typescript
const blockPath = block.path
  ? join(process.cwd(), block.path)
  : join(process.cwd(), discoverRoot, blockName);
```

### ✅ Validate Source, Not Output

```typescript
// In AI prompt
"For templates: Check template SOURCE for semantic HTML tags.
Do NOT execute or render - analyze the SOURCE CODE."
```

### ✅ Handle AI Failures Gracefully

```typescript
try {
  const result = await ai.validateDomainSemantics(context);
  return result;
} catch (error) {
  return {
    valid: true,  // Don't block on AI failure
    issues: [{
      type: 'warning',
      code: 'AI_VALIDATION_FAILED',
      message: `AI validation failed: ${error.message}`
    }]
  };
}
```

## Testing Strategy

### Unit Tests

Test individual validators in isolation:

```typescript
describe('SchemaValidator', () => {
  it('should validate input types', async () => {
    const validator = new SchemaValidator();
    const context = createMockContext();
    const result = await validator.validate(context);
    expect(result.valid).toBe(true);
  });
});
```

### Integration Tests

Test full validation pipeline:

```bash
# Run validation on example projects
blocks run --all
```

### Example Projects as Test Cases

The `examples/` directory serves as integration tests:
- `json-resume-themes/` - Template rendering pattern
- `blog-content-validator/` - Content validation pattern

Keep these examples working as reference implementations.

## Future Development

### Planned Features

- **Lint Validators** - ESLint, Prettier integration
- **Chain Validators** - Multi-step validation pipelines
- **Shadow Validators** - Advisory-only (doesn't block)
- **Scoring Validators** - Metrics for dashboards
- **Output Validators** - Render with test data, validate output
- **Auto-Healing** - AI proposes fixes, not just feedback

### Visual Validators (Already Implemented!)

Screenshot-based validation is already in `@blocksai/visual-validators`:
- ScreenshotCapture (Playwright)
- AxeValidator (WCAG compliance)
- VisionValidator (AI vision with GPT-4o)

**Next Steps:**
- Integrate into CLI pipeline
- Add to example projects
- Document usage patterns

## Key Takeaways

When building Blocks features:

1. **Think layers** - Development-time vs runtime, source vs output
2. **Validators validate** - Don't put validation logic in block implementations
3. **Read all files** - Domain validator needs complete context
4. **Respect flexibility** - Users organize projects their way
5. **Trust validated code** - If source passes dev validation, trust it at runtime
6. **Handle AI failures** - Fall back gracefully, don't crash
7. **Document decisions** - Architecture choices matter
8. **Test both layers** - Dev-time validation AND runtime behavior

---

**Remember:** Blocks validates SOURCE CODE at development time. Trust validated code at runtime.
