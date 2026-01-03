# Blocks User Guide

A comprehensive guide for using the Blocks framework to validate your code against domain semantics at development time.

## What is Blocks?

Blocks is a development-time validation framework that uses AI to ensure your source code adheres to domain-specific rules and semantics. Instead of catching issues at runtime, Blocks validates your **source code** during development, providing actionable feedback before deployment.

### Core Philosophy

- **Development-Time Validation**: Validate source code, not runtime behavior
- **Deterministic Templates**: Same input + same template = same output (always)
- **AI-Powered Semantics**: Use LLMs to understand domain intent and check compliance
- **Simple Implementations**: Block implementations stay small (~20 lines) because validation happens separately

## Installation

```bash
# Install globally
npm install -g @blocksai/cli

# Or use with npx
npx @blocksai/cli init
```

**Requirements:**
- Node.js >= 20.0.0
- pnpm (recommended) or npm

## Quick Start

### 1. Initialize a Project

```bash
blocks init
```

This creates a `blocks.yml` configuration file in your project root.

### 2. Create Your First Block

Create a directory structure:
```
your-project/
├── blocks.yml
└── blocks/
    └── my-block/
        ├── index.ts    # Exports
        ├── block.ts    # Implementation
        └── template.hbs # (optional) Template file
```

### 3. Configure blocks.yml

```yaml
$schema: "blocks/v2"
name: my-project

blocks:
  my-block:
    description: "My first block"
    inputs:
      - name: data
        type: object
    outputs:
      - name: result
        type: string
```

### 4. Run Validation

```bash
# Validate a single block
blocks run my-block

# Validate all blocks
blocks run --all
```

## The blocks.yml Configuration

### Full Schema Reference

```yaml
# Schema version (required for v2.0 features)
$schema: "blocks/v2"

# Project name
name: my-project

# Project philosophy - guides AI validation
philosophy:
  - "Code must be accessible and semantic"
  - "Prefer clarity over cleverness"
  - "All user-facing text must be localizable"

# Domain definitions
domain:
  # Entities are the core data structures in your domain
  entities:
    user:
      fields:
        - id
        - name
        - email
      optional:
        - avatar
        - bio

    post:
      fields:
        - title
        - content
        - author
      optional:
        - tags
        - publishedAt

  # Semantics define qualitative concepts the AI should understand
  semantics:
    readability:
      description: "Text should be easy to read and understand"
      extraction_hint: "Look for short sentences, clear vocabulary"

    accessibility:
      description: "UI must be usable by people with disabilities"
      extraction_hint: "Check for ARIA labels, semantic HTML, color contrast"

    engagement_score:
      description: "How engaging the content is (0-1 scale)"
      schema:
        type: number
        minimum: 0
        maximum: 1

# Block definitions
blocks:
  # Simple block in default location (./blocks/theme.modern/)
  theme.modern:
    description: "Modern theme with clean typography"
    inputs:
      - name: resume
        type: Resume
      - name: config
        type: ThemeConfig
    outputs:
      - name: html
        type: string

  # Block with custom path
  components.header:
    description: "Reusable header component"
    path: src/components/header
    inputs:
      - name: title
        type: string
      - name: navigation
        type: NavItem[]
    outputs:
      - name: element
        type: HTMLElement

  # Block with custom validation rules
  content.article:
    description: "Article content block"
    inputs:
      - name: article
        type: Article
    outputs:
      - name: html
        type: string
    validators:
      domain:
        rules:
          - id: seo_optimized
            description: "Must include meta tags and semantic headings"
          - id: image_alt_text
            description: "All images must have descriptive alt text"

  # Block that skips certain validators
  utils.formatter:
    description: "Internal formatting utility"
    skip_validators:
      - domain
    inputs:
      - name: text
        type: string
    outputs:
      - name: formatted
        type: string

  # Block with file exclusions
  theme.complex:
    description: "Complex theme with many assets"
    exclude:
      - "*.test.ts"
      - "fixtures/**"
      - "__snapshots__/**"
    inputs:
      - name: data
        type: object
    outputs:
      - name: html
        type: string

# Validators configuration
validators:
  # Simple validator references
  - schema        # Validates input/output signatures
  - shape.ts      # Validates file structure (index.ts, block.ts exist)

  # Domain validator with global rules
  - name: domain
    config:
      rules:
        - id: semantic_html
          description: "Use semantic HTML elements (header, main, nav, etc.)"
        - id: no_inline_styles
          description: "Avoid inline styles, use CSS classes"

# AI provider configuration
ai:
  provider: anthropic  # openai | anthropic | google
  model: claude-3-5-sonnet-latest
  on_failure: warn     # warn | error | skip

# Validation cache (speeds up repeated runs)
cache:
  path: .blocks-cache
```

## Block Structure

### Directory Layout

Each block is a directory containing:

```
blocks/
└── my-block/
    ├── index.ts      # Required: exports the block
    ├── block.ts      # Required: implementation
    ├── template.hbs  # Optional: Handlebars template
    ├── styles.css    # Optional: styles
    └── utils.ts      # Optional: helper functions
```

### index.ts (Required)

```typescript
export { myBlock } from './block';
export type { MyBlockInput, MyBlockOutput } from './types';
```

### block.ts (Required)

```typescript
import Handlebars from 'handlebars';
import template from './template.hbs';

interface MyBlockInput {
  data: object;
}

interface MyBlockOutput {
  html: string;
}

const compiledTemplate = Handlebars.compile(template);

export function myBlock(input: MyBlockInput): MyBlockOutput {
  return {
    html: compiledTemplate(input.data)
  };
}
```

### Custom Block Paths

Blocks can live anywhere in your project:

```yaml
blocks:
  # Default location: ./blocks/my-block/
  my-block:
    description: "Uses default path"

  # Custom location
  header:
    description: "Lives in src/components"
    path: src/components/header

  # Nested custom location
  forms.login:
    description: "Login form component"
    path: src/features/auth/components/login-form
```

## Validators

### Built-in Validators

| Validator | ID | Purpose |
|-----------|-----|---------|
| Schema | `schema` or `schema.io` | Validates input/output signatures match blocks.yml |
| Shape | `shape.ts` or `shape.exports.ts` | Validates file structure (index.ts, block.ts exist) |
| Domain | `domain` or `domain.validation` | AI-powered semantic validation |

### Validator Pipeline

Validators run in the order specified:

```yaml
validators:
  - schema      # Runs first (fast, deterministic)
  - shape.ts    # Runs second (fast, filesystem check)
  - domain      # Runs last (slower, AI-powered)
```

### Domain Validator

The domain validator is the most powerful. It:

1. **Reads ALL files** in the block directory (excluding node_modules, dist, etc.)
2. **Performs static analysis** first (fast checks)
3. **Uses AI** for semantic validation
4. **Checks compliance** with:
   - Project philosophy
   - Domain entities and semantics
   - Global domain rules
   - Block-specific domain rules

### Configuring Domain Rules

**Global rules** apply to all blocks:

```yaml
validators:
  - name: domain
    config:
      rules:
        - id: semantic_html
          description: "Must use semantic HTML tags"
        - id: accessibility
          description: "Must include ARIA labels for interactive elements"
```

**Block-specific rules** are merged with global rules:

```yaml
blocks:
  theme.creative:
    description: "Creative theme with artistic freedom"
    validators:
      domain:
        rules:
          - id: creative_expression
            description: "May use experimental CSS and animations"
```

### Skipping Validators

Skip validators for specific blocks:

```yaml
blocks:
  internal.util:
    description: "Internal utility, skip domain checks"
    skip_validators:
      - domain
```

### Excluding Files from Validation

Exclude files from being read by validators:

```yaml
blocks:
  my-block:
    exclude:
      - "*.test.ts"
      - "*.spec.ts"
      - "__tests__/**"
      - "fixtures/**"
```

## AI Configuration

### Supported Providers

| Provider | Models |
|----------|--------|
| OpenAI | `gpt-4o-mini`, `gpt-4o` |
| Anthropic | `claude-3-5-sonnet-latest`, `claude-3-5-haiku-latest` |
| Google | `gemini-1.5-flash`, `gemini-1.5-pro` |

### Environment Variables

Set your API key:

```bash
# OpenAI
export OPENAI_API_KEY=sk-...

# Anthropic
export ANTHROPIC_API_KEY=sk-ant-...

# Google
export GOOGLE_GENERATIVE_AI_API_KEY=...
```

Or use a `.env` file in your project root.

### AI Failure Handling

```yaml
ai:
  provider: anthropic
  model: claude-3-5-sonnet-latest
  on_failure: warn  # Options: warn | error | skip
```

- `warn`: Show warning but don't fail validation (default)
- `error`: Fail validation if AI is unavailable
- `skip`: Silently skip AI validation

## CLI Commands

### blocks init

Initialize a new blocks.yml file:

```bash
blocks init
```

### blocks run

Validate blocks:

```bash
# Validate a single block
blocks run my-block

# Validate all blocks
blocks run --all

# With verbose output
blocks run my-block --verbose
```

### Exit Codes

- `0`: All validations passed
- `1`: One or more validations failed

## Domain Modeling

### Entities

Entities represent the core data structures in your domain:

```yaml
domain:
  entities:
    resume:
      fields:
        - basics
        - work
        - education
        - skills
      optional:
        - projects
        - awards
        - languages
```

The AI validator uses entities to:
- Verify blocks use the correct data structures
- Check that required fields are accessed
- Ensure data flows correctly between blocks

### Semantics

Semantics define qualitative concepts:

```yaml
domain:
  semantics:
    professional_tone:
      description: "Content should be professional and formal"
      extraction_hint: "Avoid slang, use proper grammar"

    visual_hierarchy:
      description: "UI should have clear visual hierarchy"
      extraction_hint: "Check heading levels, spacing, typography scale"

    performance_score:
      description: "Performance metric (0-100)"
      schema:
        type: number
        minimum: 0
        maximum: 100
```

### Philosophy

Philosophy statements guide overall validation:

```yaml
philosophy:
  - "Accessibility is non-negotiable"
  - "Prefer semantic HTML over divs with classes"
  - "All text must support internationalization"
  - "Keep components small and focused"
```

The AI considers philosophy when evaluating every block.

## Examples

### Example 1: Resume Theme Validator

```yaml
$schema: "blocks/v2"
name: json-resume-themes

philosophy:
  - "Themes must be accessible and print-friendly"
  - "Use semantic HTML for structure"
  - "Support all standard resume sections"

domain:
  entities:
    resume:
      fields:
        - basics
        - work
        - education
        - skills

    basics:
      fields:
        - name
        - label
        - email
      optional:
        - phone
        - url
        - image

  semantics:
    readability:
      description: "Resume should be easy to scan quickly"
    print_friendly:
      description: "Should render well when printed"
    ats_compatible:
      description: "Should be parseable by applicant tracking systems"

blocks:
  theme.modern:
    description: "Clean, modern resume theme"
    inputs:
      - name: resume
        type: Resume
    outputs:
      - name: html
        type: string

  theme.classic:
    description: "Traditional resume layout"
    inputs:
      - name: resume
        type: Resume
    outputs:
      - name: html
        type: string

validators:
  - schema
  - shape.ts
  - name: domain
    config:
      rules:
        - id: semantic_sections
          description: "Use article/section tags for resume sections"
        - id: contact_accessibility
          description: "Contact info must be in an accessible format"

ai:
  provider: anthropic
  model: claude-3-5-sonnet-latest
```

### Example 2: Blog Content Validator

```yaml
$schema: "blocks/v2"
name: blog-content-validator

philosophy:
  - "Content must be engaging and well-structured"
  - "SEO best practices are required"
  - "Images must have alt text"

domain:
  entities:
    post:
      fields:
        - title
        - content
        - author
        - publishedAt
      optional:
        - tags
        - featuredImage
        - excerpt

  semantics:
    seo_score:
      description: "SEO optimization score (0-100)"
      schema:
        type: number
        minimum: 0
        maximum: 100

    readability_grade:
      description: "Flesch-Kincaid reading grade level"

blocks:
  post.standard:
    description: "Standard blog post renderer"
    inputs:
      - name: post
        type: Post
    outputs:
      - name: html
        type: string

  post.featured:
    description: "Featured post with hero image"
    inputs:
      - name: post
        type: Post
    outputs:
      - name: html
        type: string
    validators:
      domain:
        rules:
          - id: hero_image_required
            description: "Featured posts must have a hero image"

validators:
  - schema
  - shape.ts
  - name: domain
    config:
      rules:
        - id: heading_hierarchy
          description: "Headings must follow proper hierarchy (h1 > h2 > h3)"
        - id: image_optimization
          description: "Images should specify width/height to prevent layout shift"

ai:
  provider: openai
  model: gpt-4o
  on_failure: warn
```

### Example 3: Component Library

```yaml
$schema: "blocks/v2"
name: ui-components

philosophy:
  - "Components must be accessible (WCAG 2.1 AA)"
  - "Support keyboard navigation"
  - "Use CSS custom properties for theming"

domain:
  entities:
    button:
      fields:
        - label
        - onClick
      optional:
        - variant
        - disabled
        - icon

  semantics:
    a11y_compliant:
      description: "Meets WCAG 2.1 AA accessibility standards"
    keyboard_navigable:
      description: "Can be fully operated with keyboard"

blocks:
  button.primary:
    description: "Primary action button"
    path: src/components/Button/Primary
    inputs:
      - name: props
        type: ButtonProps
    outputs:
      - name: element
        type: ReactElement

  button.secondary:
    description: "Secondary action button"
    path: src/components/Button/Secondary
    inputs:
      - name: props
        type: ButtonProps
    outputs:
      - name: element
        type: ReactElement

  modal.dialog:
    description: "Modal dialog component"
    path: src/components/Modal
    inputs:
      - name: props
        type: ModalProps
    outputs:
      - name: element
        type: ReactElement
    validators:
      domain:
        rules:
          - id: focus_trap
            description: "Must trap focus within modal when open"
          - id: escape_close
            description: "Must close on Escape key press"

validators:
  - schema
  - shape.ts
  - name: domain
    config:
      rules:
        - id: aria_labels
          description: "Interactive elements must have aria-label or aria-labelledby"
        - id: focus_visible
          description: "Focus states must be visible"

ai:
  provider: anthropic
  model: claude-3-5-haiku-latest
  on_failure: warn
```

## Best Practices

### 1. Start with Philosophy

Define your project's core principles first. These guide all AI validation:

```yaml
philosophy:
  - "Accessibility is mandatory, not optional"
  - "Performance matters - avoid unnecessary dependencies"
  - "Code should be self-documenting"
```

### 2. Define Clear Entities

Model your domain data explicitly:

```yaml
domain:
  entities:
    user:
      fields:
        - id
        - email
        - name
      optional:
        - avatar
```

### 3. Use Semantic Descriptions

Write clear descriptions for semantics and rules:

```yaml
# Good
semantics:
  readability:
    description: "Text should be understandable by an 8th-grade reading level"
    extraction_hint: "Short sentences, common words, clear structure"

# Bad
semantics:
  readability:
    description: "readable"  # Too vague for AI
```

### 4. Layer Your Validators

Run fast validators first:

```yaml
validators:
  - schema      # Fastest - schema check
  - shape.ts    # Fast - file existence
  - domain      # Slowest - AI validation
```

### 5. Use Caching

Enable caching for faster repeated runs:

```yaml
cache:
  path: .blocks-cache
```

Add `.blocks-cache` to your `.gitignore`.

### 6. Exclude Test Files

Don't validate test fixtures:

```yaml
blocks:
  my-block:
    exclude:
      - "*.test.ts"
      - "*.spec.ts"
      - "__tests__/**"
      - "fixtures/**"
      - "__mocks__/**"
```

### 7. Handle AI Failures Gracefully

In CI/CD, use `warn` to prevent flaky builds:

```yaml
ai:
  on_failure: warn  # Don't fail CI if AI is unavailable
```

## Troubleshooting

### "Block not found"

Check that:
1. Block is defined in `blocks.yml`
2. Directory exists at the expected path
3. Path is correct (custom `path` or default `./blocks/{name}/`)

### "Missing required files"

The shape validator requires:
- `index.ts` - must exist with exports
- `block.ts` - must exist

### "AI validation failed"

1. Check your API key is set correctly
2. Verify the provider/model combination is valid
3. Check for rate limiting
4. Try `on_failure: warn` to continue despite AI errors

### "Input/output schema mismatch"

The schema validator found a mismatch between:
- What's declared in `blocks.yml`
- What's exported from the block

Check that your block's types match the declaration.

## Key Concepts Summary

| Concept | Purpose |
|---------|---------|
| **blocks.yml** | Central configuration file |
| **Block** | A validated unit of code (directory with index.ts, block.ts) |
| **Entity** | Domain data structure definition |
| **Semantic** | Qualitative concept for AI to evaluate |
| **Philosophy** | Project-wide guiding principles |
| **Validator** | Checks code against rules (schema, shape, domain) |
| **Domain Rules** | Specific requirements for AI to check |

## Remember

**Blocks validates SOURCE CODE at development time.**

- Templates are deterministic: same input → same output
- If source code passes validation, trust it at runtime
- Keep block implementations simple (~20 lines)
- Let validators do the heavy lifting
- AI reads ALL your files - give it complete context

---

For internal development of the Blocks framework itself, see `CLAUDE.md`.
