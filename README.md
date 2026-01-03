<p align="center">
  <img src="assets/logo.png" alt="Blocks Logo" width="120" height="120">
</p>

<h1 align="center">Blocks</h1>

<p align="center">
  <strong>AI-assisted coding with semantic guardrails</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@blocksai/cli"><img src="https://img.shields.io/npm/v/@blocksai/cli.svg" alt="npm version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://github.com/anthropics/blocks/actions"><img src="https://img.shields.io/github/actions/workflow/status/anthropics/blocks/ci.yml?branch=main" alt="Build Status"></a>
  <a href="https://www.npmjs.com/package/@blocksai/cli"><img src="https://img.shields.io/npm/dm/@blocksai/cli.svg" alt="Downloads"></a>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#examples">Examples</a> •
  <a href="#packages">Packages</a> •
  <a href="#contributing">Contributing</a>
</p>

---

Blocks is a development-time validator that lets AI agents write code freely while maintaining consistency through domain semantics and multi-layer validation. Think of it as a type system for your domain logic—except it uses LLMs to check semantic alignment, not just syntax.

## The Problem

You're using Claude Code, Cursor, or another AI coding tool. The agent generates code fast, but:

- **No shared understanding** - The AI doesn't know your domain concepts (what's a "Resume"? what makes HTML "semantic"?)
- **Inconsistent output** - Each generation drifts from your design patterns
- **No feedback loop** - The AI can't learn from mistakes without manual correction
- **Runtime surprises** - Bugs emerge when generated code violates implicit rules

You need a way to **teach the AI your domain** and **validate before runtime**.

## The Solution

Blocks provides:

1. **Domain specification in `blocks.yml`** - Define entities, signals, measures, and rules once
2. **Multi-layer validation** - Schema (fast) → Shape (fast) → Domain (AI-powered)
3. **Semantic feedback loop** - AI writes code → Blocks validates → AI learns from feedback
4. **Drift detection** - Spots when code diverges from spec, you decide: fix code or update spec

Not a framework. Not a runtime library. A **development-time validator** that keeps AI-generated code aligned with your domain.

## How It Works

### 1. Define Your Domain (`blocks.yml`)

```yaml
name: "Resume Themes"

# AI Configuration
ai:
  provider: "openai"
  model: "gpt-4o-mini"

philosophy:
  - "Themes must use semantic HTML and be accessible"
  - "All layouts must be responsive"

domain:
  entities:
    resume:
      description: "A resume document"
      fields: [basics, work, education, skills]

  signals:
    readability:
      description: "How easy is the resume to scan?"
      extraction_hint: "Look for clear headings, whitespace, logical flow"

  measures:
    valid_html:
      constraints:
        - "Must use semantic tags (header, main, section)"
        - "Must include ARIA labels"

blocks:
  domain_rules:  # Apply to ALL blocks by default
    - id: semantic_html
      description: "Use semantic HTML5 tags"
    - id: accessibility
      description: "Include proper ARIA labels"

  theme.modern_professional:
    type: theme
    description: "Modern professional resume theme"
    path: "themes/modern-professional"
    inputs:
      - name: resume
        type: entity.resume
        description: "Resume data to render"
    outputs:
      - name: html
        type: string
        measures: [valid_html]
        constraints:
          - "Must produce valid semantic HTML"
    # Inherits blocks.domain_rules automatically

# Validators (optional - defaults to domain only)
# Uncomment to run all validators:
# validators:
#   - schema     # Fast config structure checks
#   - shape.ts   # File structure validation
#   - domain     # AI-powered semantic validation
```

### 2. AI Writes Implementation

```typescript
// themes/modern-professional/block.ts
export function modernProfessionalTheme(resume: Resume) {
  if (!resume.basics?.name) {
    throw new Error("Resume must include name");
  }
  return { html: template(resume) };
}
```

```handlebars
<!-- themes/modern-professional/template.hbs -->
<header role="banner">
  <h1>{{basics.name}}</h1>
  <p>{{basics.label}}</p>
</header>

<main>
  <section aria-label="Work Experience">
    <h2>Experience</h2>
    {{#each work}}
      <article>
        <h3>{{position}} at {{company}}</h3>
        <p>{{summary}}</p>
      </article>
    {{/each}}
  </section>
</main>
```

### 3. Blocks Validates

```bash
$ blocks run theme.modern_professional
```

**Output (with all validators enabled):**
```
📦 Validating: theme.modern_professional

  ✓ schema ok (inputs/outputs match spec)
  ✓ shape.ts ok (files exist, exports present)
  ✓ domain ok (semantic HTML found in template source)

✅ Block "theme.modern_professional" passed all validations
```

**Note:** By default, only the `domain` validator runs. To run all validators, add:
```yaml
validators:
  - schema
  - shape.ts
  - domain
```

### 4. AI Learns from Feedback

If validation fails, Blocks provides **actionable feedback**:

```
📦 Validating: theme.modern_professional

  ✓ schema ok
  ✓ shape ok

  ⚠ [domain] Template missing semantic HTML tags
    → Suggestion: Replace <div class="header"> with <header role="banner">

  ⚠ [domain] No ARIA labels found in work experience section
    → Suggestion: Add aria-label="Work Experience" to section

❌ Block "theme.modern_professional" has warnings
```

The AI reads this output, updates the code, and re-runs validation until it passes.

## Getting Started

### Prerequisites

- Node.js ≥20.0.0
- pnpm (recommended) or npm
- OpenAI API key (for AI-powered domain validation)

### Installation

```bash
# Install CLI globally
npm install -g @blocksai/cli

# Or use in project
npm install --save-dev @blocksai/cli
```

### Initialize

```bash
# Create blocks.yml
blocks init
```

This generates a starter `blocks.yml`:

```yaml
# Blocks Configuration
# Domain: Define your project's semantic domain model

name: "My Blocks Project"
root: "blocks"  # Default directory for blocks

# AI Configuration (optional)
# Defaults to OpenAI gpt-4o-mini if not specified
ai:
  provider: "openai"  # Options: openai, anthropic, google
  model: "gpt-4o-mini"  # OpenAI: gpt-4o-mini, gpt-4o | Anthropic: claude-3-5-sonnet-20241022

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

  signals:
    user_engagement:
      description: "Measures how engaged a user is with the system"
      extraction_hint: "Look for login frequency, feature usage, interaction patterns"

  measures:
    score_0_1:
      constraints:
        - "Value must be between 0 and 1"

# Block definitions
blocks:
  # Default domain rules for all blocks
  domain_rules:
    - id: clear_intent
      description: "Block implementation must clearly express domain intent"

  example_block:
    type: function
    description: "Example block that computes user engagement score"
    path: "blocks/example-block"
    inputs:
      - name: user
        type: entity.user
    outputs:
      - name: result
        type: entity.result
        measures: [score_0_1]

# Discovery configuration
targets:
  kind: "block"
  discover:
    root: "blocks"
```

### Set API Key

Domain validation uses OpenAI by default. Set your API key:

```bash
export OPENAI_API_KEY="sk-..."
```

Or create `.env`:

```
OPENAI_API_KEY=sk-...
```

Get a key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Create Your First Block

```bash
mkdir -p blocks/example-block
```

**blocks/example-block/block.ts:**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

interface Result {
  value: number;
  score: number;
}

export function exampleBlock(user: User): { result: Result } {
  // Calculate engagement score (0-1 range)
  const score = user.email.includes("@") ? 0.8 : 0.3;

  return {
    result: {
      value: 1,
      score
    }
  };
}
```

**blocks/example-block/index.ts:**
```typescript
export { exampleBlock } from "./block.js";
```

### Validate

```bash
blocks run example_block
```

**Output:**
```
📦 Validating: example_block
  ✓ schema ok
  ✓ shape ok
  ✓ domain ok

✅ Block "example_block" passed all validations
```

## Using with Claude Code

This is where Blocks shines. Here's a simulated session showing how Claude Code + Blocks work together:

### Session: Building a Weather Dashboard

**User:**
> Build a weather dashboard block that takes a city and returns HTML with current weather

**Claude Code:**
> I'll help you build that. Let me first read `blocks.yml` to understand your domain.

```bash
$ cat blocks.yml
```

**Claude Code:**
> I see your project defines entities and domain rules. I'll create a new block called `weather_dashboard`. Let me add it to the spec first:

```yaml
# Claude edits blocks.yml
blocks:
  weather_dashboard:
    description: "Weather dashboard with current conditions"
    inputs:
      - name: city
        type: string
    outputs:
      - name: html
        type: string
        measures: [valid_html]
```

**Claude Code:**
> Now I'll implement the block:

```typescript
// blocks/weather_dashboard/block.ts
export async function weatherDashboard(city: string) {
  const weather = await fetchWeather(city);

  return {
    html: `
      <div class="weather">
        <h1>${city}</h1>
        <p>${weather.temp}°F</p>
        <p>${weather.condition}</p>
      </div>
    `
  };
}
```

```typescript
// blocks/weather_dashboard/index.ts
export { weatherDashboard } from "./block.js";
```

**Claude Code:**
> Let me validate this:

```bash
$ blocks run weather_dashboard
```

**Output:**
```
📦 Validating: weather_dashboard

  ✓ schema ok
  ✓ shape ok

  ⚠ [domain] HTML output uses non-semantic tags
    → Suggestion: Replace <div class="weather"> with semantic tags like <article> or <section>

  ⚠ [domain] Missing ARIA labels for accessibility
    → Suggestion: Add role and aria-label attributes

❌ Block "weather_dashboard" has warnings
```

**Claude Code:**
> I see the validation issues. The HTML isn't using semantic tags. Let me fix that:

```typescript
// blocks/weather_dashboard/block.ts (updated)
export async function weatherDashboard(city: string) {
  const weather = await fetchWeather(city);

  return {
    html: `
      <article role="region" aria-label="Weather Dashboard">
        <header>
          <h1>${city} Weather</h1>
        </header>
        <section aria-label="Current Conditions">
          <p><strong>Temperature:</strong> ${weather.temp}°F</p>
          <p><strong>Conditions:</strong> ${weather.condition}</p>
        </section>
      </article>
    `
  };
}
```

**Claude Code:**
> Running validation again:

```bash
$ blocks run weather_dashboard
```

**Output:**
```
📦 Validating: weather_dashboard
  ✓ schema ok
  ✓ shape ok
  ✓ domain ok

✅ Block "weather_dashboard" passed all validations
```

**Claude Code:**
> Perfect! The block now passes all validations. It uses semantic HTML (`<article>`, `<header>`, `<section>`) and includes proper ARIA labels for accessibility.

---

**This is the feedback loop:**
1. AI writes code based on domain spec
2. Blocks validates and provides specific feedback
3. AI reads validation output and fixes issues
4. Repeat until validation passes

The AI **learns your domain semantics** through validation feedback.

## Multi-Block Projects with Claude Code

Let's see a more complex scenario: building 5 resume themes at once.

**User:**
> Build 5 resume themes: modern, creative, minimal, professional, and tech. They should all follow our domain rules.

**Claude Code:**
> I'll create 5 themes. Since they share domain rules, I'll define them once in `blocks.yml`:

```yaml
blocks:
  domain_rules:  # Inherited by ALL themes
    - id: semantic_html
      description: "Use semantic HTML5 tags (header, main, section, article)"
    - id: accessibility
      description: "Include ARIA labels and roles"
    - id: responsive
      description: "Include media queries for mobile"

  theme.modern:
    description: "Modern theme with bold typography"
    path: "themes/modern"
    # Inherits domain_rules automatically

  theme.creative:
    description: "Creative theme with artistic layout"
    path: "themes/creative"

  theme.minimal:
    description: "Minimal theme with clean design"
    path: "themes/minimal"

  theme.professional:
    description: "Traditional professional theme"
    path: "themes/professional"

  theme.tech:
    description: "Tech-focused theme with code aesthetics"
    path: "themes/tech"
```

**Claude Code:**
> Now I'll implement all 5 themes. Each will have `block.ts`, `template.hbs`, and `index.ts`.

```bash
# Claude creates directory structure
mkdir -p themes/{modern,creative,minimal,professional,tech}
```

**Claude Code:**
> Creating theme.modern:

```typescript
// themes/modern/block.ts
export function modernTheme(resume: Resume) {
  if (!resume.basics?.name) throw new Error("Name required");
  return { html: template(resume) };
}
```

```handlebars
<!-- themes/modern/template.hbs -->
<article role="document" aria-label="Resume for {{basics.name}}">
  <header role="banner" class="hero">
    <h1>{{basics.name}}</h1>
    <p class="tagline">{{basics.label}}</p>
  </header>

  <main>
    <section aria-label="Work Experience">
      <h2>Experience</h2>
      {{#each work}}
        <article class="job">
          <h3>{{position}}</h3>
          <p>{{company}} • {{startDate}} - {{endDate}}</p>
        </article>
      {{/each}}
    </section>
  </main>
</article>

<style>
  @media (max-width: 768px) {
    .hero { padding: 1rem; }
  }
</style>
```

**Claude Code:**
> I'll create the other 4 themes similarly... (creates all implementations)
>
> Now let me validate all themes at once:

```bash
$ blocks run --all
```

**Output:**
```
📦 Validating: theme.modern
  ✓ schema ok
  ✓ shape ok
  ✓ domain ok

📦 Validating: theme.creative
  ✓ schema ok
  ✓ shape ok
  ⚠ [domain] Missing responsive media queries
    → Suggestion: Add @media queries for mobile viewports

📦 Validating: theme.minimal
  ✓ schema ok
  ✓ shape ok
  ✓ domain ok

📦 Validating: theme.professional
  ✓ schema ok
  ✓ shape ok
  ✓ domain ok

📦 Validating: theme.tech
  ✓ schema ok
  ✓ shape ok
  ⚠ [domain] Section missing ARIA label
    → Suggestion: Add aria-label to <section> for skills

❌ 2 blocks have warnings
```

**Claude Code:**
> I see 2 themes need fixes. Let me update them:

```handlebars
<!-- themes/creative/template.hbs - adding media queries -->
<style>
  /* ... existing styles ... */

  @media (max-width: 768px) {
    .creative-layout { flex-direction: column; }
  }
</style>
```

```handlebars
<!-- themes/tech/template.hbs - adding ARIA label -->
<section aria-label="Technical Skills">
  <h2>Skills</h2>
  {{#each skills}}...{{/each}}
</section>
```

**Claude Code:**
> Running validation again:

```bash
$ blocks run --all
```

**Output:**
```
📦 Validating all blocks...
  ✓ theme.modern - passed
  ✓ theme.creative - passed
  ✓ theme.minimal - passed
  ✓ theme.professional - passed
  ✓ theme.tech - passed

✅ All 5 blocks passed validation
```

**Claude Code:**
> All themes now pass validation! They all follow the domain rules (semantic HTML, accessibility, responsiveness) that were defined once in `blocks.yml`.

---

**Key advantages:**
- **DRY domain rules** - Define once, inherit everywhere
- **Batch validation** - Check all blocks with `--all`
- **Consistent quality** - AI follows same rules across all implementations
- **Fast iteration** - Validation catches issues before runtime

## How Validation Works

Blocks uses a **three-layer validation pipeline**:

### Layer 1: Schema (Fast, Deterministic)

Validates that inputs/outputs match `blocks.yml` specification.

```
✓ Block has all required inputs
✓ Output types match spec
```

### Layer 2: Shape (Fast, Deterministic)

Validates file structure and exports.

```
✓ index.ts exists and exports block function
✓ block.ts exists
✓ All required files present
```

### Layer 3: Domain (Slow, AI-Powered)

**This is the magic.** The domain validator:

1. **Reads ALL files** in the block directory (block.ts, template.hbs, styles, etc.)
2. **Passes complete source to AI** with context:
   - Project philosophy statements
   - Domain entities, signals, measures
   - Domain rules
   - Block specification
3. **AI analyzes source code** (not output!) for semantic compliance
4. **Returns actionable feedback**

**Example AI prompt:**
```
Project Philosophy:
- "Themes must use semantic HTML and be accessible"

Domain Rules:
- semantic_html: "Use semantic HTML5 tags (header, main, section)"
- accessibility: "Include ARIA labels and roles"

Block Files:
--- block.ts ---
export function modernTheme(resume: Resume) { ... }

--- template.hbs ---
<header role="banner">
  <h1>{{basics.name}}</h1>
</header>

Analyze these files. Does the template.hbs use semantic HTML tags?
Does it include ARIA labels? Return specific issues if not.
```

**Why validate source, not output?**

Templates are deterministic. If `template.hbs` passes validation once, it will ALWAYS generate correct HTML. No need to parse output at runtime.

## Architecture

### Development-Time vs Runtime

**CRITICAL:** Blocks validates **SOURCE CODE** at development time, NOT runtime behavior.

```
Development Time (Blocks):           Runtime (Your App):
┌─────────────────────┐             ┌──────────────────┐
│ Read source files   │             │ Validate input   │
│ (block.ts, .hbs)    │             │ data only        │
├─────────────────────┤             ├──────────────────┤
│ AI analyzes source  │             │ Execute function │
│ for semantics       │             │                  │
├─────────────────────┤             ├──────────────────┤
│ Report issues       │             │ Return output    │
│                     │             │                  │
└─────────────────────┘             └──────────────────┘
      ↑                                    ↑
      │                                    │
   Trust validated                    Trust code
   source is correct                  was validated
```

**Consequence:** Block implementations stay simple (~20 lines). All semantic validation happens at development time.

### Packages

Blocks is a monorepo with focused packages:

- **@blocksai/cli** - Command-line interface
- **@blocksai/schema** - blocks.yml parser (Zod schemas)
- **@blocksai/domain** - Domain modeling and static analysis
- **@blocksai/validators** - Validator implementations
- **@blocksai/ai** - Multi-provider AI abstraction (OpenAI, Anthropic, Google)

## Real-World Examples

### Example 1: JSON Resume Themes

**Problem:** Need to generate multiple resume themes that are all semantic, accessible, and responsive.

**Solution:** Define domain rules once, let AI generate themes, validate with Blocks.

See: [`examples/json-resume-themes/`](./examples/json-resume-themes/)

**Domain:**
- Entity: `resume` (JSON Resume schema)
- Measure: `valid_html` (semantic tags, ARIA labels, responsive)
- Rules: semantic_html, accessibility, responsive_design

**Validation:** Blocks reads Handlebars template source, AI checks for semantic HTML patterns.

### Example 2: Blog Content Validator

**Problem:** Blog posts should have humor, conversational tone, and proper structure.

**Solution:** Define content quality as domain constraints, validate markdown files.

See: [`examples/blog-content-validator/`](./examples/blog-content-validator/)

**Domain:**
- Signals: `humor_presence`, `conversational_tone`, `biology_reference`
- Rules: humor_required, no_corporate_speak

**Validation:** Blocks reads markdown file, AI analyzes content for domain signals.

## Configuration Reference

### `blocks.yml` Structure

```yaml
name: string                   # Project name
root?: string                  # Default directory for blocks (optional, defaults to "blocks")

# AI Configuration (optional - defaults to OpenAI gpt-4o-mini)
ai:
  provider: openai | anthropic | google
  model: string                # OpenAI: gpt-4o-mini, gpt-4o
                               # Anthropic: claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022
                               # Google: gemini-1.5-flash, gemini-1.5-pro
  apiKey?: string              # Or use env var (OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY)

philosophy:
  - string                     # Design principles (guide AI validation)

domain:
  entities:
    [name]:
      description: string      # What this entity represents
      fields: string[]         # Entity fields

  signals:
    [name]:
      description: string      # What to detect/extract
      extraction_hint?: string # How to extract/detect it

  measures:
    [name]:
      constraints: string[]    # Validation constraints

blocks:
  domain_rules:                # Default rules inherited by ALL blocks
    - id: string
      description: string

  [name]:
    type?: string              # Optional type hint (function, theme, validator, etc.)
    description: string        # What this block does
    path?: string              # Custom directory (default: blocks/[name])
    inputs?:
      - name: string
        type: string           # Can reference: entity.*, string, number, etc.
        description?: string   # Input description
        optional?: boolean
    outputs?:
      - name: string
        type: string
        measures?: string[]    # Reference to domain.measures
        constraints?: string[] # Additional constraints
    domain_rules?:             # Override defaults completely for this block
      - id: string
        description: string

validators?:                   # Optional - defaults to ["domain"] if omitted
  - string                     # Built-in validator short name (e.g., "schema", "shape.ts", "domain")
  OR
  - name: string               # Custom validator
    run: string                # Validator ID to execute
    config?: any               # Optional validator configuration
```

### Environment Variables

```bash
# AI Provider API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

## Frequently Asked Questions

### How is this different from TypeScript?

TypeScript validates **syntax and types**. Blocks validates **domain semantics**.

Example:
- TypeScript: "This function returns a string" ✓
- Blocks: "This HTML string uses semantic tags and includes ARIA labels" ✓

Blocks operates at a higher level of abstraction.

### Does Blocks run at runtime?

**No.** Blocks is a development-time validator. Run it during development, not in production.

Your application just imports and executes the validated functions. No Blocks runtime overhead.

### What if I don't have an API key?

Schema and shape validation still work (fast, deterministic checks). You'll miss domain validation (AI-powered semantic checks).

### Can I use Anthropic/Google instead of OpenAI?

Yes! Configure in `blocks.yml`:

```yaml
ai:
  provider: anthropic
  model: claude-3-5-sonnet-latest
```

Blocks uses Vercel AI SDK v6 internally, supporting OpenAI, Anthropic, and Google.

### How much does validation cost?

Domain validation uses AI, so there's a cost per validation:
- ~2-5 cents per block with GPT-4o-mini (default)
- ~0.5-1 cent per block with GPT-3.5-turbo

For 100 blocks: ~$2-5 per full validation run.

Use `--all` sparingly in large projects. Validate incrementally as you develop.

### Can I skip domain validation for some blocks?

Not yet, but planned. Future: `domain_rules: []` to opt out.

For now, domain validation falls back to warnings on failure (doesn't block).

### Does Blocks modify my code?

**No.** Blocks only reads and validates. It never writes code.

AI agents (like Claude Code) read Blocks' validation output and modify code based on feedback.

### How do I integrate with CI/CD?

```bash
# In CI pipeline
npm install -g @blocksai/cli
export OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}
blocks run --all

# Exits with error code if validation fails
```

Works with GitHub Actions, GitLab CI, etc.

### What if validation is too slow?

Domain validation uses AI (slow). Strategies:

1. **Validate incrementally** - `blocks run <name>` after each change
2. **Skip in CI** - Only validate on pre-merge, not every commit
3. **Use faster models** - gpt-4o-mini instead of gpt-4o
4. **Cache results** - Future: validation result caching (planned)

### Can I write custom validators?

Yes! Implement the `Validator` interface:

```typescript
import { Validator, ValidatorContext, ValidationResult } from '@blocksai/validators';

export class MyValidator implements Validator {
  id = "custom.my_validator.v1";

  async validate(ctx: ValidatorContext): Promise<ValidationResult> {
    // Your logic
    return { valid: true, issues: [] };
  }
}
```

Add to CLI pipeline. See [CLAUDE.md](./CLAUDE.md) for details.

## Roadmap

- [x] Core schema and domain modeling
- [x] Multi-layer validation (schema, shape, domain)
- [x] AI-powered semantic validation
- [x] Multi-provider support (OpenAI, Anthropic, Google)
- [x] CLI with `init` and `run` commands
- [ ] Validation result caching
- [ ] Lint validators (ESLint, Prettier)
- [ ] Chain validators (multi-step pipelines)
- [ ] Output validators (render + validate)
- [ ] Auto-healing (AI proposes fixes)
- [ ] VSCode extension
- [ ] GitHub Action for CI

## Contributing

Contributions welcome! See [CLAUDE.md](./CLAUDE.md) for architecture details.

```bash
# Setup
git clone https://github.com/yourusername/blocks
cd blocks
pnpm install
pnpm build

# Make changes
cd packages/validators
# ... edit code ...
pnpm build

# Test
cd examples/json-resume-themes
blocks run --all

# Create changeset
pnpm changeset
```

## Inspiration

Blocks draws from:

- **Cube.dev** - Semantic data modeling for analytics
- **Malloy** - Semantic layer for SQL
- **PDDL** - Planning domain definition language
- **Type systems** - But for domain semantics, not syntax

## License

MIT

## Links

- [Documentation](./docs) - Architecture and guides
- [Examples](./examples) - Real-world usage
- [NPM Package](https://www.npmjs.com/package/@blocksai/cli) - Install the CLI

---

**Built for the age of agentic coding.**

If you're using Claude Code, Cursor, or any AI coding tool, Blocks helps you maintain consistency and teach your AI agents domain semantics through validation feedback.

Star if useful. Issues and PRs welcome.
