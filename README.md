# 🧱 Blocks

**Domain-driven validation and orchestration for agentic coding workflows**

Blocks is a system for controlling AI code generation through explicit domain semantics, multi-layer validation, and evolutionary design.

## Why Blocks?

Modern AI coding tools (Claude Code, Cursor, GPT engineers) generate code fast — but without a **design system**, output becomes inconsistent and unmaintainable.

Blocks provides:

- **Domain modeling** (entities, signals, measures — like Cube.dev/Malloy for code)
- **Multi-validator pipelines** (schema, shape, lint, domain, chain, shadow, scoring)
- **Agent orchestration** (AI reads spec, writes code, validates, learns from feedback)
- **Spec evolution** (detect domain drift, update spec or code)

## Quick Start

### Installation

```bash
pnpm add -D @blocks/cli
```

### Initialize

```bash
pnpm blocks init
```

This creates a `blocks.yml` configuration file.

### Define Your Domain

Edit `blocks.yml`:

```yaml
project:
  name: "My Project"
  domain: "myproject.general"

philosophy:
  - "Blocks must be small, composable, deterministic."

domain:
  entities:
    user:
      fields: [id, name, email]

  signals:
    engagement:
      description: "How engaged is the user?"

  measures:
    score_0_1:
      constraints:
        - "Value must be between 0 and 1."

blocks:
  user_engagement_score:
    description: "Calculate user engagement score"
    inputs:
      - name: user
        type: entity.user
    outputs:
      - name: score
        type: measure.score_0_1
```

### Create a Block

```bash
mkdir -p blocks/user_engagement_score
```

`blocks/user_engagement_score/block.ts`:

```typescript
export async function userEngagementScore(user: any) {
  // Implementation
  return { score: 0.85 };
}
```

`blocks/user_engagement_score/index.ts`:

```typescript
export { userEngagementScore } from "./block.js";
```

### Validate

```bash
pnpm blocks run user_engagement_score
```

Output:

```
🧱 Blocks Validator

📦 Validating: user_engagement_score
  ✓ schema ok
  ✓ shape ok
  ✓ domain ok

  ✅ Block "user_engagement_score" passed all validations
```

## Features

### 🎯 Domain Modeling

Define your domain semantics in `blocks.yml`:

- **Entities** - the "things" in your system
- **Signals** - domain concepts to extract
- **Measures** - constraints on outputs
- **Philosophy** - design principles

### 🔍 Multi-Layer Validation

**Blocks is a development-time validator** that analyzes source code, not runtime behavior.

Four validator types:

1. **Schema** - Fast, structural validation of I/O signatures
2. **Shape** - Fast, file-based validation of structure
3. **Domain** - AI-powered semantic validation of ALL source files
4. **Output** - User-defined validators that render and check output (future)

**How Domain Validation Works:**

1. Reads **all files** in block directory (block.ts, template.hbs, etc.)
2. Passes complete source code to AI with Blocks philosophy context
3. AI analyzes source for semantic compliance (not runtime behavior)
4. For templates: checks template source for semantic HTML, ARIA labels, media queries
5. Returns specific, actionable feedback

**Example:**
```
📦 Validating: theme.modern_professional
- Reading all files from: themes/modern-professional/
  Found: block.ts, template.hbs, index.ts

✓ domain ok - Template uses semantic HTML tags
✓ domain ok - ARIA labels present in template source
✓ domain ok - CSS media queries found @media (max-width: 768px)
```

**Key Principle:** Validate source code at development time, trust validated code at runtime.

See [Validators Architecture](./docs/validators-architecture.md) for complete details.

### 🤖 Agentic Integration

Works seamlessly with Claude Code, Cursor, and other AI coding tools:

1. Agent reads `blocks.yml`
2. Agent writes code
3. Agent runs `blocks run <name>`
4. Agent interprets validator output
5. Agent fixes issues and re-runs

### 🔄 Spec Evolution

Detects when code introduces new concepts:

```
⚠ [domain] Undocumented output field: alerts_es
→ Suggestion: Add alerts_es to outputs in blocks.yml
```

Agent can propose spec updates → User approves → Spec evolves with code.

## Architecture

### Monorepo Structure

```
blocks/
├── packages/
│   ├── cli/           # @blocks/cli - Main CLI
│   ├── schema/        # @blocks/schema - blocks.yml parser
│   ├── domain/        # @blocks/domain - Domain modeling
│   ├── validators/    # @blocks/validators - Validator implementations
│   └── ai/            # @blocks/ai - AI-powered validation (Vercel AI SDK v6)
├── apps/
│   └── docs/          # Documentation site (coming soon)
└── docs/              # Technical documentation
```

### Packages

- **@blocks/cli** - Command-line interface (`blocks` command)
- **@blocks/schema** - Zod schemas and YAML parser
- **@blocks/domain** - Domain registry and analyzer
- **@blocks/validators** - Validator implementations
- **@blocks/ai** - Vercel AI SDK v6 integration (OpenAI)

## Commands

### `blocks init`

Create a new `blocks.yml` configuration file.

```bash
blocks init
blocks init --force  # overwrite existing
```

### `blocks run <name>`

Validate a specific block.

```bash
blocks run user_engagement_score
```

### `blocks run --all`

Validate all blocks.

```bash
blocks run --all
```

## API Key Configuration

Blocks uses OpenAI for AI-powered domain validation. To enable full validation features, you need to configure your OpenAI API key.

### Option 1: Environment Variable (Recommended)

Set the `OPENAI_API_KEY` environment variable in your shell:

```bash
export OPENAI_API_KEY="sk-your-key-here"
```

To make this permanent, add it to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.).

### Option 2: .env File

Create a `.env` file in your project directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```
OPENAI_API_KEY=sk-your-key-here
```

The CLI will automatically load environment variables from `.env` when running validations.

### Getting an API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and save it securely

### What Happens Without an API Key?

Without an API key, domain validation will be skipped:

```
📦 Validating: my_block
  ✓ schema ok
  ✓ shape ok
  ⚠ [domain] AI validation failed: OpenAI API key is missing
```

Schema and shape validation will still work, but you won't get AI-powered semantic feedback.

## Configuration

`blocks.yml` structure:

```yaml
project:
  name: string
  domain: string

philosophy: string[]

domain:
  entities: { [name]: { fields: string[] } }
  signals: { [name]: { description, extraction_hint? } }
  measures: { [name]: { constraints: string[] } }

blocks:
  [name]:
    description: string
    inputs?: Array<{ name, type, optional? }>
    outputs?: Array<{ name, type, measures?, constraints? }>
    domain_rules?: Array<{ id, description }>
    path?: string  # custom path to block folder

validators:
  schema?: Validator[]
  shape?: Validator[]
  lint?: Validator[]
  domain?: Validator[]
  chain?: Validator[]
  shadow?: Validator[]
  scoring?: Validator[]

pipeline:
  name: string
  steps: Array<{ id, run?, run_chain? }>

agent:
  mode: string
  rules: string[]
  cli: { single, all }

targets:
  kind: string
  discover: { root: string }
```

## Documentation

- [Architecture](./docs/architecture.md) - System design and data flow
- [Validators](./docs/validators.md) - Detailed validator documentation
- [Domain Modeling](./docs/domain-modeling.md) - Domain semantics guide

## Development

### Setup

```bash
git clone <repo>
cd blocks
pnpm install
pnpm build
```

### Running locally

```bash
cd packages/cli
pnpm build
node dist/index.js init
```

### Testing

```bash
pnpm test
```

### Contributing

1. Create a changeset: `pnpm changeset`
2. Commit your changes
3. Open a PR

## Publishing

Managed via Changesets:

1. Create changesets: `pnpm changeset`
2. Merge to main
3. Changesets bot creates version PR
4. Merge version PR → auto-publish to npm

## Roadmap

- [x] Core schema and domain modeling
- [x] Schema and shape validators
- [x] AI-powered domain validation
- [x] CLI with `run` and `init` commands
- [ ] Lint validators
- [ ] Chain validators
- [ ] Shadow validators
- [ ] Scoring validators
- [ ] Documentation site (Fumadocs)
- [ ] VSCode extension
- [ ] Claude Code integration package
- [ ] Example repositories

## Inspiration

Blocks draws inspiration from:

- **Cube.dev** - Semantic data modeling
- **Malloy** - Semantic SQL layer
- **PDDL** - Planning domain definition
- **JSON Schema** - Structure validation
- **GraphQL** - API contracts

## License

MIT

## Links

- [NPM Package](https://www.npmjs.com/package/@blocks/cli) (coming soon)
- [Documentation](./docs) (work in progress)
- [GitHub](https://github.com/yourusername/blocks) (update this)

---

**Made with ❤️ for agentic coding workflows**
