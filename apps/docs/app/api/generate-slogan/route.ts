import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

const BLOCKS_CONTEXT = `
# Blocks Framework - Complete Context

## What is Blocks?

Blocks is a **negotiation layer for human-AI collaboration**. It's a development-time validation framework that helps humans and AI agents work together to build reliable software.

## Core Philosophy

1. **Both humans and AI write code freely** - No restrictions on who can edit what
2. **Blocks validates the result** - Multi-layer validation catches issues at every level
3. **Drift detection** - When code diverges from spec, Blocks reports it
4. **You decide** - Fix the code or update the spec - drift is not failure, it's a conversation

## The Problem Blocks Solves

When AI agents generate code, they often:
- Miss domain-specific requirements
- Introduce concepts not in your spec
- Violate semantic rules (like missing ARIA labels, breaking responsive design)
- Drift from your domain model over time

When humans write code, they:
- Forget edge cases
- Miss accessibility requirements
- Don't follow domain rules consistently
- Introduce breaking changes without realizing

**Blocks catches all of this through validation.**

## How It Works

### 1. Define Your Domain in blocks.yml

\`\`\`yaml
project:
  name: "JSON Resume Themes"
  domain: "jsonresume.themes"

philosophy:
  - "Resume themes must prioritize readability and professionalism"
  - "All themes must be responsive and accessible"
  - "Semantic HTML and proper structure are required"

domain:
  entities:
    resume:
      fields: [basics, work, education, skills]

  signals:
    readability:
      description: "Measure how easy the resume is to scan"

  measures:
    valid_html:
      constraints:
        - "Must use semantic HTML tags (header, main, section)"
        - "Must include ARIA labels for accessibility"

blocks:
  domain_rules:
    - id: semantic_html
      description: "Must use semantic HTML tags"
    - id: accessibility
      description: "Must include proper ARIA labels"

  theme.modern_professional:
    description: "Modern, clean resume theme"
    inputs:
      - name: resume
        type: entity.resume
    outputs:
      - name: html
        type: string
        measures: [valid_html]
\`\`\`

### 2. Write Code (Human or AI)

\`\`\`typescript
export function modernProfessionalTheme(resume: Resume) {
  return { html: template(resume) };
}
\`\`\`

### 3. Run Validation

\`\`\`bash
blocks run theme.modern_professional
\`\`\`

### 4. Get Multi-Layer Feedback

**Schema Validator** (fast, deterministic):
- ✓ Inputs match types
- ✓ Outputs match types

**Shape Validator** (fast, deterministic):
- ✓ index.ts exports block
- ✓ block.ts exists

**Domain Validator** (AI-powered, semantic):
- ✓ Template uses semantic HTML (header, main, section)
- ✓ ARIA labels present
- ⚠ Missing responsive meta tag
- ⚠ No media queries for mobile

### 5. Fix or Update Spec

**Option 1: Fix the code** (if you forgot something)
**Option 2: Update the spec** (if requirements changed)

## Multi-Layer Validation

### Layer 1: Schema (Deterministic)
- Input/output types using Zod
- Fast, reliable, catches type errors

### Layer 2: Shape (Deterministic)
- File structure (index.ts, block.ts)
- Exports present
- Conventions followed

### Layer 3: Domain (AI-Powered)
- **Reads ALL source files** (templates, code, utils, styles)
- Analyzes against domain rules and philosophy
- Checks semantic alignment (ARIA, HTML, responsive design)
- Detects undocumented concepts (drift)

## Extensible Validator System

The built-in validators (schema, shape, domain) are just recommendations. You can:

- **Add custom validators**: security, performance, accessibility
- **Override defaults**: Replace domain validator with your own
- **Build pipelines**: Chain validators together
- **Shadow mode**: Advisory-only validators that don't block

\`\`\`yaml
validators:
  custom:
    - run: "my.custom.validator"
  security:
    - run: "security.audit"
  performance:
    - run: "perf.benchmark"
\`\`\`

## AI Configuration

Blocks uses **Vercel AI SDK v6** and supports multiple providers:

\`\`\`yaml
ai:
  provider: "openai"  # openai | anthropic | google
  model: "gpt-4o-mini"
\`\`\`

**Supported providers:**
- OpenAI: gpt-4o-mini, gpt-4o, gpt-4-turbo
- Anthropic: claude-3-5-sonnet, claude-3-5-haiku
- Google: gemini-1.5-flash, gemini-1.5-pro

## Default Domain Rules (DRY)

Define rules once at blocks.domain_rules, all blocks inherit:

\`\`\`yaml
blocks:
  domain_rules:
    - id: semantic_html
      description: "Must use semantic HTML"

  theme.modern:
    # Inherits domain_rules automatically

  theme.creative:
    domain_rules:
      # Override completely (explicit beats implicit)
\`\`\`

## Real-World Examples

### Example 1: JSON Resume Themes

**Domain**: Template rendering with semantic HTML and accessibility

\`\`\`yaml
blocks:
  domain_rules:
    - id: semantic_html
    - id: accessibility
    - id: responsive_design

  theme.modern_professional:
    # Renders resume with Handlebars templates
    # Domain validator checks template SOURCE for:
    # - Semantic HTML tags
    # - ARIA labels
    # - Media queries
\`\`\`

### Example 2: Blog Content Validator

**Domain**: Content quality validation for humor and conversational tone

\`\`\`yaml
blocks:
  domain_rules:
    - id: humor_required
      description: "Must include wit or light-hearted commentary"
    - id: conversational_tone
      description: "Must use 'you' and 'I' to connect"

  validator.blog_post:
    # Domain validator reads markdown source
    # Checks for conversational tone, humor, engagement
\`\`\`

## Key Concepts

### 1. Development-Time Validation

Blocks validates **source code** during development, NOT runtime behavior.

Templates are deterministic:
- Same input → Same template → Same output
- If template passes dev validation, trust it at runtime
- No need to parse HTML output every time

### 2. Drift Detection

When you (or AI) introduce a new concept not in the spec:

\`\`\`typescript
return {
  html: template(resume),
  pdf: generatePdf(resume)  // ← NEW concept
}
\`\`\`

Blocks detects it:
\`\`\`
⚠ Undocumented output field: pdf
→ Add to blocks.yml or remove from code
\`\`\`

### 3. Spec Evolution

The spec and implementation evolve together:

1. Human/AI writes code
2. Blocks detects drift
3. You decide: fix code or update spec
4. Spec becomes more accurate over time

### 4. Discovery Phase

We're exploring what Blocks should be through practical examples:
- Resume themes (template rendering)
- Blog validators (content quality)
- HR recommendation engines (scoring & ranking)

Each example reveals new patterns and requirements.

## The Validation Loop

\`\`\`
1. Write code (human or AI)
   ↓
2. Run: blocks run <name>
   ↓
3. Get validation feedback
   ↓
4. Drift detected?
   ├─ Yes → Fix code or update spec
   └─ No → ✅ Done
\`\`\`

## Why Blocks Matters

**For AI Agents:**
- Semantic guardrails prevent domain violations
- Philosophy statements guide generation
- Drift detection catches hallucinations
- Multi-layer feedback improves output quality

**For Humans:**
- Spec serves as single source of truth
- Validators catch mistakes early
- Domain rules enforce consistency
- Frees you from remembering every constraint

**For Teams:**
- Shared domain language
- Consistent code across contributors
- Living documentation (the spec)
- Automatic drift detection in CI/CD

## Technical Architecture

- **Monorepo**: Turborepo + pnpm workspaces
- **Packages**: @blocksai/schema, @blocksai/domain, @blocksai/validators, @blocksai/cli, @blocksai/ai
- **Built with**: TypeScript, Zod, Vercel AI SDK v6
- **Publishing**: Changesets for version management
- **Docs**: Next.js 16 + Fumadocs

## The Elevator Pitch

Blocks is a **negotiation layer** where humans and AI collaborate with guardrails. Both write code freely, Blocks validates semantics, and drift detection helps you decide: fix code or evolve the spec. Multi-layer validation catches everything from type errors to missing ARIA labels. Built on Vercel AI SDK v6, supporting OpenAI, Anthropic, and Google.

## Future Directions

- **Output validators**: Validate rendered output with test data
- **Visual validators**: Screenshot-based validation with vision models
- **Progressive validation**: Real-time feedback as you code
- **Auto-healing**: AI proposes fixes for validation failures
- **Shadow mode**: Advisory validators that don't block
- **Scoring validators**: Metrics dashboards for quality trends
`;

export async function POST() {
  try {
    const result = streamText({
      model: openai('gpt-4o'),
      system: `You are a creative copywriter crafting unique elevator pitches for Blocks - a framework for human-AI collaboration with semantic guardrails.

Your task: Generate a ONE-SENTENCE elevator pitch that captures what Blocks does in a memorable, engaging way.

Guidelines:
- ONE sentence only (can use em-dash or colon for clarity)
- 15-25 words ideal
- Focus on the VALUE PROPOSITION, not technical details
- Make it sound natural and conversational
- Vary your approach each time:
  * Sometimes lead with the problem
  * Sometimes lead with the solution
  * Sometimes use a metaphor
  * Sometimes emphasize human-AI collaboration
  * Sometimes focus on drift detection
  * Sometimes highlight multi-layer validation
  * Sometimes play with the "negotiation layer" concept
- Avoid buzzwords and corporate speak
- Each pitch should feel fresh and different
- Think about different angles: developer benefits, team benefits, AI safety, code quality, etc.

Examples of GOOD pitches (vary from these):
- "Blocks lets humans and AI code together freely while catching everything from type errors to missing ARIA labels"
- "A negotiation layer for human-AI collaboration—both write code, Blocks validates semantics, you decide what stays"
- "Multi-layer validation that speaks your domain language and catches drift before it becomes technical debt"
- "Your spec evolves with your code—AI guardrails that help you decide: fix it or update the spec"
- "From template rendering to content quality, Blocks validates what type systems can't reach"

Generate ONE unique elevator pitch now.`,
      prompt: `Context about Blocks:\n\n${BLOCKS_CONTEXT}\n\nGenerate a fresh, unique elevator pitch (one sentence, 15-25 words).`,
      maxTokens: 100,
      temperature: 1.2, // Higher creativity
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Slogan generation error:', error);
    return new Response('Error generating slogan', { status: 500 });
  }
}
