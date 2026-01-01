# Blocks Specification v2.0

> **Guardrails that keep your agentic code generation aligned with your domain**

---

## Executive Summary

Blocks is a development-time validation framework for AI-generated code. It creates a feedback loop where AI agents (like Claude Code) can iteratively run validation until all code aligns with domain requirements. When domain rules change (e.g., "all modules must target American markets" or "use the shared database connection"), AI agents can identify which modules need updating.

**Key Innovation:** Unlike runtime validation frameworks, Blocks validates *source code intent* at development time, treating code as the artifact to validate.

---

## Table of Contents

1. [Core Concepts](#1-core-concepts)
2. [Schema Reference](#2-schema-reference)
3. [Validators](#3-validators)
4. [Domain Model](#4-domain-model)
5. [Blocks](#5-blocks)
6. [Configuration](#6-configuration)
7. [CLI Interface](#7-cli-interface)
8. [Ecosystem](#8-ecosystem)

---

## 1. Core Concepts

### 1.1 What Blocks Solves

For AI-generated codebases, Blocks addresses three interconnected problems:

1. **Catching AI mistakes** - LLMs hallucinate; Blocks catches semantic errors before they ship
2. **Enforcing standards** - Consistent patterns across AI-generated code
3. **Domain alignment** - AI stays within business domain boundaries

### 1.2 The Feedback Loop

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   AI Agent (Claude Code, etc.)                          │
│        │                                                │
│        ▼                                                │
│   Generate/Modify Code                                  │
│        │                                                │
│        ▼                                                │
│   blocks run --all                                      │
│        │                                                │
│        ├── Pass ──► Done                                │
│        │                                                │
│        └── Fail ──► Read errors, fix code, repeat       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Development-Time Philosophy

Blocks validates source code, not runtime behavior. Templates and implementations are deterministic:

```
Same input → Same code → Same output
```

If source code passes validation during development, it will produce correct output at runtime. No runtime parsing of output to check domain rules.

---

## 2. Schema Reference

### 2.1 Complete blocks.yml Schema

```yaml
# Schema version (required for v2+)
$schema: "blocks/v2"

# Project identifier (required)
name: "HR Recommendation Engine"

# Guiding principles for AI validators (optional)
# Included in domain validator prompts - not directly enforced
philosophy:
  - "Scoring adapters must provide objective, consistent evaluations"
  - "Each adapter focuses on a single dimension of candidate fit"
  - "Scores must include reasoning for transparency"

# Domain model (optional)
domain:
  # Core data types with fields
  entities:
    resume:
      fields: [basics, work, education, skills]
      # Optional fields use '?' suffix
      optional: [certifications, projects]

    score_result:
      fields: [score, reasoning, matched_items, gaps]

  # Domain vocabulary - merged signals + measures concept
  semantics:
    skill_alignment:
      description: "How well candidate skills match job requirements"
    score_0_1:
      description: "Normalized score between 0 and 1"
      # JSON Schema constraints for runtime validation
      schema:
        type: number
        minimum: 0
        maximum: 1

# Validation pipeline (optional, defaults to [domain])
validators:
  # Built-in validators
  - schema
  - shape

  # Validator with config
  - name: domain
    config:
      rules:
        - id: objective_scoring
          description: "Scores must be based on objective criteria from inputs"
        - id: graceful_degradation
          description: "Handle missing or incomplete data without crashing"

  # Custom validator (npm package convention)
  - name: output
    run: "validators/output"
    config:
      strict: true

# Block definitions (required)
blocks:
  adapter.skills:
    # Required - used in domain validator prompt
    description: "Evaluates candidate skills against job requirements"

    # Path relative to project root (required if not in ./blocks/)
    path: "adapters/skills"

    # Files to exclude from validation
    exclude:
      - "**/*.test.ts"
      - "__mocks__/**"

    # Input/output contract
    inputs:
      - name: resume
        type: entity.resume
      - name: job
        type: entity.job_posting

    outputs:
      - name: result
        type: entity.score_result
        # Reference semantics for constraints
        semantics: [score_0_1]

    # Skip specific validators for this block
    skip_validators: []

    # Per-block validator config overrides (deep merged with global)
    validators:
      domain:
        rules:
          # Additional rule for this block only
          - id: skills_specific
            description: "Must compare skill names case-insensitively"

    # Test data for output validator (flexible: file path, folder, or inline)
    test_data: "data/skills-test.json"

# AI provider configuration (optional)
ai:
  provider: "openai"  # openai | anthropic | google
  model: "gpt-4o-mini"
  # Behavior on AI failure
  on_failure: "warn"  # warn | error | skip

# Cache configuration (optional)
cache:
  path: ".blocks/cache.json"  # Configurable for monorepos
```

### 2.2 Schema Versioning

The `$schema` field declares which version of the Blocks specification the file follows:

```yaml
$schema: "blocks/v2"
```

- **Required** for v2.0+
- **Omitted** implies v1.0 (current)
- CLI validates config against declared schema version

---

## 3. Validators

### 3.1 Validator Pipeline

Validators run in array order, but **all validators always run** - no fail-fast. This provides complete diagnostics.

```yaml
validators:
  - schema    # Fast structural check
  - shape     # Fast file existence check
  - domain    # AI-powered semantic analysis
  - output    # Custom runtime validation
```

### 3.2 Built-in Validators

| Short Name | Full ID | Purpose |
|------------|---------|---------|
| `schema` | `schema.io` | Validates blocks.yml structure |
| `shape` | `shape.exports` | Verifies file exports exist |
| `domain` | `domain.semantic` | AI-powered semantic validation |

Short names and full IDs both work - flexibility is maintained for backwards compatibility.

### 3.3 Validator Configuration

Validators accept configuration at the global level:

```yaml
validators:
  - name: domain
    config:
      rules:
        - id: rule_id
          description: "Rule description for AI context"
```

### 3.4 Per-Block Overrides

Blocks can override validator config. Overrides are **deep merged** with global config:

```yaml
blocks:
  adapter.skills:
    validators:
      domain:
        rules:
          # This rule is ADDED to global rules (not replaced)
          - id: extra_rule
            description: "Additional rule for this block"
```

**Important:**
- Blocks can only configure validators that exist in the global `validators` array (error otherwise)
- Rules merge by default - same ID rules are deduplicated
- No mechanism to remove global rules (explicit is better)

### 3.5 Block Opt-Out

Blocks can skip specific validators:

```yaml
blocks:
  legacy.module:
    skip_validators: [domain]  # Only run schema and shape
```

### 3.6 Custom Validators

Custom validators follow npm package conventions:

```javascript
// validators/output/index.js
export default {
  id: "output.runtime",
  description: "Validates block output against test data",

  // Declare dependencies on other validators
  dependsOn: ["schema"],

  async validate(context) {
    const { blockName, blockPath, config, testData } = context;

    return {
      status: "passed",  // passed | failed | skipped | warning | error
      issues: []
    };
  }
};
```

**Package convention:** Validators can be npm packages with full `package.json` metadata.

### 3.7 Validator Dependencies

Validators can declare dependencies on other validators:

```javascript
export default {
  id: "output.runtime",
  dependsOn: ["schema"],  // Waits for schema to complete first
  // ...
};
```

The system resolves dependencies and orders execution accordingly.

### 3.8 Validation Results

Results use multiple states for clarity:

```typescript
type ValidationStatus =
  | "passed"   // All checks passed
  | "failed"   // Hard failure, issues found
  | "skipped"  // Validator was skipped (cache, opt-out, etc.)
  | "warning"  // Soft issues, didn't block
  | "error";   // Validator itself errored (not code issues)

interface ValidationResult {
  status: ValidationStatus;
  issues: ValidationIssue[];
}
```

### 3.9 Domain Validator Intelligence

The domain validator should be intelligent about token usage:

- **Prioritize meaningful files** - Entry points, exports, core logic first
- **Smart truncation** - Don't just cut off at limit
- **Report token usage** - Always show how many tokens were used
- **Skip large files** - Summarize instead of sending full content

---

## 4. Domain Model

### 4.1 Entities

Entities define core data types. Fields are simple names - validators infer types from context.

```yaml
domain:
  entities:
    resume:
      fields: [basics, work, education, skills]
      optional: [certifications, projects]
```

**Optionality:** Fields in `optional` array are not required. All others are required.

**Dual-mode:** Simple field lists compile to JSON Schema internally for runtime validation when needed.

### 4.2 Semantics

Semantics (formerly signals + measures) define domain vocabulary - terms and concepts the domain uses:

```yaml
domain:
  semantics:
    # Conceptual term
    skill_alignment:
      description: "How well candidate skills match job requirements"

    # Measurable constraint with JSON Schema
    score_0_1:
      description: "Normalized score between 0 and 1"
      schema:
        type: number
        minimum: 0
        maximum: 1
```

**Purpose:** Establishes shared vocabulary for how blocks discuss the business domain. Referenced by validators and blocks.

### 4.3 $ref Support

Support for external references at all levels:

```yaml
domain:
  entities:
    # Local file reference
    resume:
      $ref: "./schemas/resume.yml"

    # URL reference
    job_posting:
      $ref: "https://example.com/schemas/job.json"

    # Registry reference (future)
    # standard_resume:
    #   $ref: "jsonresume/v1.0.0"
```

**Resolution priority:** Local files → URLs → Registry (as ecosystem matures)

---

## 5. Blocks

### 5.1 Block Definition

```yaml
blocks:
  adapter.skills:
    description: "Evaluates candidate skills"  # Required
    path: "adapters/skills"                    # Required if not in ./blocks/

    inputs:
      - name: resume
        type: entity.resume
      - name: config
        type: object
        optional: true

    outputs:
      - name: result
        type: entity.score_result
        semantics: [score_0_1]
```

### 5.2 Path Resolution

**Simplified:** The `root` field is removed. Every block must declare `path` if not in `./blocks/`:

```yaml
blocks:
  # Lives in ./blocks/adapter.skills/
  adapter.skills:
    description: "..."

  # Lives in custom location
  legacy.module:
    description: "..."
    path: "src/legacy/module"
```

### 5.3 Block Naming

Dot notation (`adapter.skills`) is **convention only** - no semantic meaning. Users can use any naming they want:

```yaml
blocks:
  adapter.skills: {}      # Convention
  skills-adapter: {}      # Also fine
  SkillsAdapter: {}       # Also fine
```

### 5.4 File Scope

Everything in a block's folder IS the block. Validators read all files recursively.

**Exclusions:** Per-block exclusion patterns:

```yaml
blocks:
  adapter.skills:
    exclude:
      - "**/*.test.ts"
      - "**/*.spec.ts"
      - "__tests__/**"
      - "__mocks__/**"
```

### 5.5 Test Data

Flexible format - file path, folder, or inline:

```yaml
blocks:
  adapter.skills:
    # File path
    test_data: "data/test.json"

    # Or folder
    test_data: "fixtures/"

    # Or inline
    test_data:
      resume: { skills: ["Python", "TypeScript"] }
      job: { required_skills: ["Python"] }
```

Custom validators handle interpreting and asserting against test data.

### 5.6 Description Field

The `description` field is **required** and serves multiple purposes:

- Included in domain validator AI prompts
- Available to custom validators
- Documents block purpose

---

## 6. Configuration

### 6.1 Philosophy

Philosophy statements provide AI context but are **not directly enforced**. They're included in domain validator prompts:

```yaml
philosophy:
  - "All adapters should use the Effect library"
  - "Scores must include reasoning for transparency"
```

The AI considers these when evaluating code semantics.

### 6.2 AI Configuration

```yaml
ai:
  provider: "openai"     # openai | anthropic | google
  model: "gpt-4o-mini"   # User picks model, Blocks is agnostic
  on_failure: "warn"     # warn | error | skip
```

**Model agnostic:** Blocks doesn't care about model capabilities or costs - that's the user's choice.

**Failure handling:**
- `warn` - Return valid with warning (default)
- `error` - Fail validation on AI error
- `skip` - Skip AI validation entirely

### 6.3 Cache Configuration

```yaml
cache:
  path: ".blocks/cache.json"
```

**Cache behavior:**
- Content-hash based - never expires based on time
- Same file content = same cached result
- Use `--force` to bypass cache
- Configurable path for monorepos

---

## 7. CLI Interface

### 7.1 Commands

```bash
# Validate specific block
blocks run adapter.skills

# Validate all blocks
blocks run --all

# Bypass cache
blocks run --all --force

# Initialize from template
blocks init --template=hr

# Validate blocks.yml configuration
blocks doctor

# Show help
blocks help
```

### 7.2 Output Formats

```bash
# Human-readable (default)
blocks run --all

# JSON for scripting
blocks run --all --format=json

# SARIF for IDE integration
blocks run --all --format=sarif

# JUnit for CI
blocks run --all --format=junit
```

### 7.3 Parallelism

Blocks are always validated in parallel for maximum speed. Order doesn't matter - blocks are independent.

---

## 8. Ecosystem

### 8.1 Tooling Priority

1. **JSON Schema for YAML** - Publish blocks.yml JSON Schema for IDE autocomplete
2. **CLI experience** - Clear output, helpful errors
3. **CI integration** - SARIF/JUnit output formats

### 8.2 Validator Ecosystem

Validators can come from multiple sources:

```yaml
validators:
  # Local file
  - name: custom
    run: "./validators/custom"

  # npm package
  - name: eslint
    run: "@blocks/validator-eslint"

  # Future: git reference
  # - name: community
  #   run: "github:org/validator"
```

### 8.3 Schema Registry (Future)

```yaml
domain:
  entities:
    resume:
      $ref: "blocks://jsonresume/v1.0.0"
```

Progressive: Local files → URLs → Registry as ecosystem matures.

---

## Appendix A: Migration from v1

### Breaking Changes

1. **`root` field removed** - Use `path` on each block
2. **`signals` and `measures` merged** - Use `semantics`
3. **`domain_rules` location changed** - Now in validator config
4. **`$schema` required** - Add `$schema: "blocks/v2"` to files

### Migration Steps

```yaml
# v1 (before)
root: "adapters"
blocks:
  domain_rules:
    - id: rule1
      description: "..."
  adapter.skills:
    domain_rules:
      - id: rule2
        description: "..."

# v2 (after)
$schema: "blocks/v2"
validators:
  - name: domain
    config:
      rules:
        - id: rule1
          description: "..."
blocks:
  adapter.skills:
    path: "adapters/skills"
    validators:
      domain:
        rules:
          - id: rule2
            description: "..."
```

---

## Appendix B: Example blocks.yml

Complete example for HR Recommendation Engine:

```yaml
$schema: "blocks/v2"

name: "HR Recommendation Engine"

philosophy:
  - "Scoring adapters must provide objective, consistent evaluations"
  - "Each adapter focuses on a single dimension of candidate fit"
  - "Scores must include reasoning for transparency and auditability"
  - "Adapters must handle missing or incomplete data gracefully"
  - "All evaluations are calibrated for the American job market"
  - "All adapters should use the Effect library"

domain:
  entities:
    resume:
      fields: [basics, work, education, skills]
      optional: [certifications, projects]

    job_posting:
      fields: [title, company, requirements, preferred]
      optional: [salary_range, location]

    score_result:
      fields: [score, reasoning, matched_items, gaps]
      optional: [confidence]

  semantics:
    skill_alignment:
      description: "How well candidate skills match job requirements"

    experience_relevance:
      description: "Relevance of work history to the position"

    score_0_1:
      description: "Normalized score between 0 and 1"
      schema:
        type: number
        minimum: 0
        maximum: 1

validators:
  - schema
  - shape
  - name: domain
    config:
      rules:
        - id: objective_scoring
          description: "Scores must be based on objective criteria from inputs, not hardcoded"
        - id: graceful_degradation
          description: "Handle missing or incomplete data without throwing"
        - id: effect_usage
          description: "Must use Effect.gen or Effect.tryPromise for async operations"
        - id: eeoc_compliance
          description: "Never consider protected characteristics"
  - name: output
    run: "validators/output"

blocks:
  adapter.skills:
    description: "Evaluates candidate technical and soft skills against job requirements"
    path: "adapters/skills"
    exclude: ["**/*.test.ts"]
    inputs:
      - name: resume
        type: entity.resume
      - name: job
        type: entity.job_posting
    outputs:
      - name: result
        type: entity.score_result
        semantics: [score_0_1]
    test_data: "fixtures/skills-test.json"

  adapter.experience:
    description: "Assesses relevance and depth of work experience"
    path: "adapters/experience"
    exclude: ["**/*.test.ts"]
    inputs:
      - name: resume
        type: entity.resume
      - name: job
        type: entity.job_posting
    outputs:
      - name: result
        type: entity.score_result
        semantics: [score_0_1]
    test_data: "fixtures/experience-test.json"

  adapter.education:
    description: "Evaluates educational background and certifications"
    path: "adapters/education"
    exclude: ["**/*.test.ts"]
    inputs:
      - name: resume
        type: entity.resume
      - name: job
        type: entity.job_posting
    outputs:
      - name: result
        type: entity.score_result
        semantics: [score_0_1]
    test_data: "fixtures/education-test.json"

  recommendation:
    description: "Synthesizes all adapter scores into final recommendation"
    path: "recommendation"
    exclude: ["**/*.test.ts"]
    inputs:
      - name: skills_result
        type: entity.score_result
      - name: experience_result
        type: entity.score_result
      - name: education_result
        type: entity.score_result
    outputs:
      - name: recommendation
        type: object
    skip_validators: [output]  # No output validator for this block

ai:
  provider: "openai"
  model: "gpt-4o-mini"
  on_failure: "warn"

cache:
  path: ".blocks/cache.json"
```

---

## Appendix C: Design Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Philosophy enforcement | AI context only | Let AI interpret, don't over-engineer |
| Entity types | Simple fields | Keep accessible, compile to JSON Schema internally |
| Signals + Measures | Merged as "semantics" | Same concept, reduce confusion |
| Rule inheritance | Auto-merge | DRY without complexity |
| Path resolution | Remove root | Explicit is better than implicit |
| Block composition | Independent | Composition is application concern |
| Validation flow | Always run all | Complete diagnostics matter |
| Cache expiry | Content-hash only | Deterministic behavior |
| AI failures | Configurable | Different contexts need different behavior |
| Output formats | Multiple | json, sarif, junit for different integrations |
| Language scope | TypeScript-first | Focus beats generality |
| Validator IDs | Flexible | Short names map to full IDs |
| Environments | Out of scope | Blocks validates code, not deployments |

---

*End of Specification*
