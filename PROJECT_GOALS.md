# Blocks: Project Goals

## What Blocks Is

Blocks creates a **feedback loop between your domain spec and AI agents**. It's an extensible validation framework that can validate anything at any stage—but it's most useful during development when AI agents are actively writing code.

## The Problem

Anyone using agentic coding heavily (Claude Code, Cursor, Copilot, or any LLM-powered coding tool) faces these challenges:

1. **AI code drift** - AI-generated code gradually drifts from domain requirements
2. **Spec enforcement** - Hard to enforce coding standards and domain rules across AI-assisted workflows
3. **Quality gates** - Need semantic validation that understands meaning, not just syntax patterns

Traditional tools (ESLint, TypeScript, tests) catch syntax and type errors but don't understand your domain. Blocks fills this gap with AI-powered semantic validation.

## How It Works

```
AI writes code → runs `blocks run` → sees validation issues → fixes code → repeat until pass
```

This feedback loop keeps AI-generated code aligned with your domain spec. The AI agent calls Blocks during development, sees what needs fixing, and iterates until validation passes.

## What "Blocks" Are

A "block" is any repeating module in your domain:

| Domain | Blocks |
|--------|--------|
| Blog platform | Posts, pages, comments |
| Resume builder | Themes, templates, sections |
| API service | Endpoints, handlers, middleware |
| Component library | Components, utilities, hooks |
| Content site | Articles, authors, categories |

If you have multiples of something that should follow consistent rules, those are your blocks.

## Configuration: `blocks.yml`

The `blocks.yml` file can live anywhere in your project. It defines:

- **Philosophy** - High-level principles that guide AI validation
- **Domain** - Entities (data structures) and semantics (concepts to validate)
- **Validators** - Pipeline of validation steps (built-in + custom)
- **Blocks** - Your modules with their inputs/outputs

Blocks validates relative to where `blocks.yml` lives.

## Key Concepts

### Philosophy
High-level principles the AI validator uses to evaluate code semantics. These guide the "spirit" of validation beyond mechanical rules.

### Domain Modeling
- **Entities** - Domain objects with required/optional fields
- **Semantics** - Named concepts the AI can extract and validate (readability, humor_score, accessibility, etc.)

### Validators
Extensible pipeline—built-in validators plus any custom validators you create:

| Validator | Purpose |
|-----------|---------|
| `schema` | Fast type/structure validation |
| `shape` | File structure and exports |
| `domain` | AI-powered semantic validation |
| Custom | Anything you build |

Validators can use AI or be purely deterministic. Order matters—fast validators run first.

## LLM Agnostic

Blocks works with any AI provider:
- OpenAI (GPT-4, GPT-4o-mini)
- Anthropic (Claude)
- Google (Gemini)
- Any provider supported by Vercel AI SDK

Use Blocks with any agentic coding tool. The AI model powers validators like the domain validator.

## Where Blocks Runs

Primarily useful at **development time** because AI agents call it directly. But also works in:
- CI/CD pipelines
- Pre-commit hooks
- Manual validation runs

The goal: catch domain drift before code ships.

## Current State

**Alpha/Beta** - Core features work, actively iterating on feedback.

## Vision (1-2 Years)

1. **Standard tool** - Part of every agentic coding workflow
2. **Ecosystem** - Library of validators, domain templates, integrations
3. **IDE integration** - Deep integration with coding assistants

## Documentation Tone

**Minimal and direct.** Get to the point. No fluff. Accurate technical content for developers who want to ship.

## Key Differentiators

1. **AI feedback loop** - Creates conversation between spec and AI agents
2. **Semantic validation** - Understands meaning, not just patterns
3. **Domain-aware** - Validates against business concepts
4. **Extensible** - Build any validator you need
5. **Development-time focus** - Guides AI as it writes, not just gates at the end

## What to Emphasize in Docs

1. The feedback loop with AI agents is the core mental model
2. Blocks can be any repeating modules—not a special concept
3. `blocks.yml` placement is flexible
4. Validators are extensible—you're not limited to built-ins
5. LLM agnostic—not tied to any provider
6. Philosophy and domain modeling are the heart of semantic validation
