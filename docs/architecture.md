# Blocks Architecture

## Overview

Blocks is a domain-driven validation and orchestration system for agentic coding workflows. It provides:

- **Domain modeling** (entities, signals, measures)
- **Multi-layer validation** (schema, shape, lint, domain, chain, shadow, scoring)
- **Agent integration** (Claude Code, Cursor, etc.)
- **Spec evolution** (domain drift detection and correction)

## Core Packages

### @blocks/schema

Defines the structure of `blocks.yml` using Zod schemas. Provides:

- TypeScript types for all domain concepts
- YAML parser with validation
- Schema validation utilities

### @blocks/domain

Domain modeling engine. Provides:

- `DomainRegistry` - central registry for entities, signals, measures
- `DomainAnalyzer` - validates blocks against domain semantics
- Drift detection for undocumented concepts

### @blocks/ai

AI-powered validation using Vercel AI SDK v6. Provides:

- `AIProvider` - wrapper for OpenAI integration
- Semantic validation methods
- Structured output generation
- Quality scoring

### @blocks/validators

Validator implementations:

- **Schema validators** - validate I/O signatures
- **Shape validators** - validate file structure
- **Domain validators** - validate semantic alignment (uses AI)
- Future: lint, chain, shadow, scoring validators

### @blocks/cli

Command-line interface. The `blocks` command provides:

- `blocks init` - create blocks.yml
- `blocks run <name>` - validate a block
- `blocks run --all` - validate all blocks

## Validation Pipeline

1. **Schema Validation**
   - Check inputs/outputs are defined
   - Check types match domain
   - Check measures exist

2. **Shape Validation**
   - Check file structure (index.ts, block.ts)
   - Check exports exist
   - Check naming conventions

3. **Domain Validation**
   - Static analysis via DomainAnalyzer
   - AI-powered semantic validation
   - Check domain rules compliance
   - Detect undocumented concepts (drift)

4. **Future Validators**
   - Lint (code quality)
   - Chain (multi-step pipelines)
   - Shadow (advisory validators)
   - Scoring (quality metrics)

## Data Flow

```
blocks.yml
    ↓
parseBlocksConfig()
    ↓
DomainRegistry
    ↓
DomainAnalyzer + Validators
    ↓
ValidationResults
    ↓
CLI Output (colored, formatted)
```

## Agentic Integration

Claude Code (or other AI coding tools) should:

1. Read `blocks.yml` before any changes
2. Run `blocks run <name>` after changes
3. Interpret validator output as instructions
4. Fix issues and re-run
5. Propose spec updates for drift

## Extensibility

- Custom validators implement the `Validator` interface
- New validator types can be added to the pipeline
- Domain semantics are user-defined in blocks.yml
- AI provider can be swapped (currently OpenAI via Vercel AI SDK)
