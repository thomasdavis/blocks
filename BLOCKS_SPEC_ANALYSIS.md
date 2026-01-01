# Blocks Framework Specification Analysis

**Comprehensive Review for Production Readiness**

*Analysis Date: January 2025*
*Analyzed Version: Current main branch*
*Reference Implementation: HR Recommendation Engine*

---

## Executive Summary

The Blocks framework introduces a novel approach to **development-time semantic validation** using AI. It combines domain-driven design principles with LLM-powered code analysis to ensure that implementations align with declared domain specifications. This analysis examines the current specification, identifies strengths and weaknesses, and suggests improvements based on industry standards and research.

**Key Innovation:** Unlike traditional validation frameworks that focus on runtime data validation, Blocks validates *source code intent* at development time, treating code as the artifact to validate rather than data flowing through the system.

**Overall Assessment:** The framework shows strong conceptual foundations but needs refinement in several areas before production deployment, particularly around specification clarity, validation determinism, and integration patterns.

---

## Table of Contents

1. [Specification Overview](#1-specification-overview)
2. [Strengths Analysis](#2-strengths-analysis)
3. [Weaknesses & Concerns](#3-weaknesses--concerns)
4. [Comparison with Industry Standards](#4-comparison-with-industry-standards)
5. [Alternative Approaches](#5-alternative-approaches)
6. [Recommendations](#6-recommendations)
7. [Research References](#7-research-references)

---

## 1. Specification Overview

### 1.1 Core Concept

Blocks defines a `blocks.yml` configuration file that serves as:
- **Domain Model Declaration** - Entities, signals, and measures
- **Block Contract Definition** - Inputs, outputs, and constraints
- **Validation Pipeline Configuration** - Which validators run and how
- **AI Configuration** - Provider and model settings

### 1.2 Current Schema Structure

```yaml
name: string                    # Required: Project identifier
root: string                    # Optional: Blocks directory root
philosophy: string[]            # Optional: Guiding principles for AI
domain:                         # Optional: Domain semantics
  entities: Record<name, {fields: string[]}>
  signals: Record<name, {description, extraction_hint?}>
  measures: Record<name, {constraints: string[]}>
blocks:                         # Required: Block definitions
  domain_rules: [{id, description}]  # Default rules for all blocks
  <block_name>:
    description: string         # Required
    path: string               # Optional: Custom path
    inputs: [{name, type, optional?}]
    outputs: [{name, type, measures?, constraints?}]
    domain_rules: [{id, description}]  # Override defaults
validators: (string | {name, run, config?})[]  # Optional: Validation pipeline
ai:                            # Optional: AI provider config
  provider: "openai" | "anthropic" | "google"
  model: string
```

### 1.3 Validation Layers

1. **Schema Validator** - Checks blocks.yml structure integrity
2. **Shape Validator** - Verifies file exports exist
3. **Domain Validator** - AI-powered semantic analysis of source code
4. **Custom Validators** - User-defined runtime validators (e.g., output validation)

---

## 2. Strengths Analysis

### 2.1 Development-Time Focus (Excellent)

**What it does well:**
- Validates source code *before* deployment, catching issues early
- Treats templates and implementations as deterministic artifacts
- Reduces runtime overhead by shifting validation left

**Industry Alignment:**
This aligns with the "shift-left" testing movement and Microsoft's guidance on [domain model layer validations](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations), which recommends validating at the domain layer rather than just at API boundaries.

**Evidence from HR Example:**
```yaml
# The skills adapter is validated at dev time
# No runtime parsing of AI output to check domain rules
adapter.skills:
  outputs:
    - name: result
      type: entity.score_result
      measures: [score_0_1]  # Constraints checked at dev time
```

### 2.2 Philosophy-Driven Validation (Innovative)

**What it does well:**
- Philosophy statements provide AI with project context
- Enables subjective quality requirements to be validated
- Creates alignment between human intent and code implementation

**HR Example Philosophies:**
```yaml
philosophy:
  - "Scoring adapters must provide objective, consistent evaluations"
  - "Each adapter focuses on a single dimension of candidate fit"
  - "Scores must include reasoning for transparency and auditability"
  - "Adapters must handle missing or incomplete data gracefully"
  - "All evaluations are calibrated for the American job market"
  - "All adapters should use the Effect library"
```

This is unique - no other validation framework captures project *values* as enforceable constraints.

### 2.3 Domain Rule Inheritance (Good DRY Pattern)

**What it does well:**
- Default rules at `blocks.domain_rules` apply to all blocks
- Block-specific rules can override (not merge)
- Reduces repetition while allowing customization

**Alignment with DDD Principles:**
This follows Eric Evans' Specification Pattern from Domain-Driven Design: "Business rules often do not fit the responsibility of any of the obvious ENTITIES or VALUE OBJECTS... [Specifications] encapsulate this domain knowledge."

### 2.4 Flexible File Structure (Good)

**What it does well:**
- No required file naming conventions (not enforcing index.ts, block.ts)
- Respects existing project organization via `path` field
- Reads ALL files for complete semantic context

**Evidence:**
```yaml
adapter.skills:
  path: "adapters/skills"  # Custom path, not blocks/adapter.skills
```

### 2.5 Multi-Provider AI Support (Good)

**What it does well:**
- Supports OpenAI, Anthropic, and Google
- Easy switching via configuration
- Graceful fallback on AI failures (warnings, not errors)

### 2.6 Rich Validation Context (Good)

**What it does well:**
- Returns detailed metadata (files analyzed, rules applied, token usage)
- Provides actionable suggestions for issues
- Full AI prompt/response captured for debugging

---

## 3. Weaknesses & Concerns

### 3.1 Non-Deterministic Validation (Critical)

**The Problem:**
AI-powered validation produces different results across runs. The same code may pass or fail depending on:
- Model version changes
- Temperature/sampling variations
- Token limits causing truncation
- Provider outages

**Impact:**
- CI/CD pipelines may have flaky tests
- Developers lose trust in validation results
- Difficult to reproduce reported issues

**Evidence from Domain Validator:**
```typescript
// AI validation can fail gracefully, turning errors into warnings
try {
  const result = await ai.validateDomainSemantics(context);
} catch (error) {
  return {
    valid: true,  // Don't block on AI failure
    issues: [{ type: 'warning', code: 'AI_VALIDATION_FAILED', ... }]
  };
}
```

**Recommendation:** See [Section 6.1](#61-address-non-determinism)

### 3.2 Vague Entity/Signal/Measure Semantics (Significant)

**The Problem:**
The specification lacks clarity on what entities, signals, and measures actually *mean* and how they should be used:

| Concept | Definition | Enforcement | Clarity |
|---------|------------|-------------|---------|
| Entity | "Core data types with fields" | Type references in inputs | Unclear how fields are validated |
| Signal | "Domain concepts to detect" | Only via AI interpretation | Completely subjective |
| Measure | "Constraints on outputs" | Type references + runtime | Unclear enforcement mechanism |

**Examples of Ambiguity:**

1. **Entity fields are strings, not typed:**
```yaml
entities:
  resume:
    fields: [basics, work, education, skills]  # What types? Required? Optional?
```

2. **Signals have no concrete validation:**
```yaml
signals:
  skill_alignment:
    description: "How well candidate skills match job requirements"
    extraction_hint: "Compare resume skills to job required_skills"
```
How does the AI "extract" this? What constitutes a pass/fail?

3. **Measure constraints are prose, not executable:**
```yaml
measures:
  score_0_1:
    constraints:
      - "Score must be between 0.0 and 1.0"
      - "Score must have at most 2 decimal places"
```
These are not machine-checkable without custom validators.

### 3.3 Type System Limitations (Significant)

**The Problem:**
The type system is too simple for real-world needs:

1. **No union types:** Can't express `entity.resume | null`
2. **No generics:** Can't express `Array<entity.score_result>`
3. **No optional fields in entities:** All fields are implicitly required
4. **No type composition:** Can't extend or compose entities
5. **Primitive types undocumented:** Is `string` valid? `number`? `boolean`?

**Comparison with JSON Schema:**
```json
{
  "type": "object",
  "properties": {
    "score": { "type": "number", "minimum": 0, "maximum": 1 },
    "reasoning": { "type": "string", "minLength": 50 }
  },
  "required": ["score", "reasoning"]
}
```

JSON Schema is far more expressive for structural validation.

### 3.4 Implicit vs Explicit Behavior (Moderate)

**The Problem:**
Too many behaviors are implicit/magical:

1. **Default validators:** If `validators` is omitted, only `["domain"]` runs
2. **Path resolution:** Complex priority (block.path → config.root → "blocks")
3. **Rule inheritance:** No keyword to explicitly inherit defaults

**Recommendation:** Favor explicit configuration over implicit defaults.

### 3.5 Validator ID Confusion (Moderate)

**The Problem:**
Short names map to technical IDs inconsistently:

| Short Name | Technical ID | Notes |
|------------|--------------|-------|
| `schema` | `schema.io` | Why not just `schema`? |
| `shape.ts` | `shape.exports.ts` | Confusing extension in name |
| `domain` | `domain.validation` | Inconsistent with above |
| `output` | `output.runtime` | Custom validator, different pattern |

This caused bugs in the caching system where `"output"` in config didn't match `"output.runtime"` in cache.

### 3.6 Missing Versioning (Significant)

**The Problem:**
The `blocks.yml` specification has no version field:

```yaml
name: "HR Recommendation Engine"
# version: "1.0"  <-- Missing!
```

**Impact:**
- No migration path for breaking changes
- Tools can't detect incompatible configurations
- Users can't lock to stable spec versions

**Comparison:** OpenAPI, AsyncAPI, and JSON Schema all include `$schema` or version fields.

### 3.7 No Schema Registry / References (Moderate)

**The Problem:**
Can't reference external schema definitions:

```yaml
# Can't do this:
entities:
  resume:
    $ref: "https://jsonresume.org/schema/v1.0.0"
```

**Impact:**
- Large schemas must be duplicated inline
- Can't share domain definitions across projects
- No ecosystem of reusable domain schemas

### 3.8 Weak Output Validator Contract (Moderate)

**The Problem:**
Custom validators have no formal contract for test data:

```yaml
adapter.skills:
  test_data: "data/test.json"  # File path? Inline object? Schema?
```

- No schema for test data structure
- No way to specify multiple test cases
- No assertions framework for output validation

### 3.9 Effect Library Coupling (Minor)

**The Problem:**
The HR example enforces Effect library usage via domain rules:

```yaml
philosophy:
  - "All adapters should use the Effect library"
domain_rules:
  - id: effect_usage
    description: "Must use Effect.gen or Effect.tryPromise for async"
```

This couples the specification to a specific library choice, reducing generality.

---

## 4. Comparison with Industry Standards

### 4.1 vs OpenAPI / AsyncAPI

| Aspect | Blocks | OpenAPI/AsyncAPI |
|--------|--------|------------------|
| **Focus** | Source code validation | API contract definition |
| **Schema** | Custom YAML | JSON Schema based |
| **Validation** | AI + static | Static only |
| **Ecosystem** | New | Mature (tooling, generators) |
| **Versioning** | None | Explicit (`openapi: "3.1.0"`) |
| **References** | None | `$ref` support |
| **Code Gen** | None | Extensive |

**Key Insight:** OpenAPI/AsyncAPI solve a different problem (API contracts) but their specification design is more mature. Blocks could learn from:
- Explicit versioning
- `$ref` for schema reuse
- Separation of schema and configuration

### 4.2 vs JSON Schema

| Aspect | Blocks Entities | JSON Schema |
|--------|-----------------|-------------|
| **Field Types** | String names only | Full type system |
| **Constraints** | Prose | Executable (`minimum`, `pattern`, etc.) |
| **Composition** | None | `allOf`, `oneOf`, `anyOf` |
| **Validation** | AI interpretation | Deterministic |

**Recommendation:** Consider using JSON Schema for entity definitions instead of `fields: [...]`.

### 4.3 vs DDD Specification Pattern

The Blocks approach aligns well with DDD's Specification Pattern:

> "The Specification Pattern is a way to encapsulate business rules into reusable, composable objects." - [Enterprise Craftsmanship](https://enterprisecraftsmanship.com/posts/specification-pattern-always-valid-domain-model/)

However, DDD specifications are typically:
- **Composable** (AND, OR, NOT) - Blocks domain_rules are not
- **Executable** - Blocks rules are prose for AI interpretation
- **Deterministic** - Blocks relies on AI, which is not deterministic

### 4.4 vs Runtime Verification Tools

| Aspect | Blocks | Dynamic Architecture Validation |
|--------|--------|--------------------------------|
| **When** | Development time | Runtime |
| **What** | Source code | Execution behavior |
| **Determinism** | AI-dependent | Deterministic metrics |
| **Coverage** | All source files | Executed paths only |

Research from [Dynatrace](https://www.dynatrace.com/resources/ebooks/javabook/employing-dynamic-architecture-validation/) suggests combining both approaches: static validation at dev time, dynamic validation at runtime.

### 4.5 vs LLM Code Analysis Tools

Modern tools like [Sourcegraph Amp](https://sourcegraph.com), [Qodo](https://qodo.ai), and [Byteable](https://www.byteable.ai/blog/best-llm-powered-code-comprehension-tool-2025/) use LLMs for code comprehension. Key differences:

| Aspect | Blocks | Commercial Tools |
|--------|--------|-----------------|
| **Purpose** | Validation | Comprehension |
| **Domain Model** | User-defined | Generic |
| **Hallucination Mitigation** | None | RAG, multi-agent |
| **Semantic Graphs** | None | Built-in |

**Recommendation:** Consider adding retrieval-augmented generation (RAG) to ground AI validation in actual code context.

---

## 5. Alternative Approaches

### 5.1 Use JSON Schema for Entities

**Current:**
```yaml
entities:
  score_result:
    fields: [score, reasoning, matched_items, gaps, confidence]
```

**Alternative:**
```yaml
entities:
  score_result:
    schema:
      type: object
      properties:
        score: { type: number, minimum: 0, maximum: 1 }
        reasoning: { type: string, minLength: 50 }
        matched_items: { type: array, items: { type: string } }
        gaps: { type: array, items: { type: string } }
        confidence: { type: number, minimum: 0, maximum: 1 }
      required: [score, reasoning, matched_items, gaps, confidence]
```

**Benefits:**
- Deterministic validation
- Reuse JSON Schema ecosystem
- More expressive type system

### 5.2 Structured Domain Rules

**Current:**
```yaml
domain_rules:
  - id: objective_scoring
    description: "Scores must be based on objective criteria from inputs"
```

**Alternative:**
```yaml
domain_rules:
  - id: objective_scoring
    description: "Scores must be based on objective criteria from inputs"
    severity: error  # or warning, info
    applies_to: [adapter.*]  # Glob pattern
    check:
      type: ai  # or static, regex, custom
      prompt: "Verify that scoring logic references input data, not hardcoded values"
    examples:
      pass:
        - "score = calculateFromSkills(resume.skills, job.required_skills)"
      fail:
        - "score = 0.75  // hardcoded"
```

**Benefits:**
- Self-documenting with examples
- Selective application via patterns
- Multiple check types (not just AI)

### 5.3 Deterministic + AI Hybrid Validation

**Approach:**
1. **Layer 1: JSON Schema** - Structural validation (deterministic)
2. **Layer 2: Static Analysis** - AST-based checks (deterministic)
3. **Layer 3: AI Semantic** - Intent validation (non-deterministic, optional)

```yaml
validators:
  - type: schema      # L1: JSON Schema validation
    fail_on: error
  - type: static      # L2: AST pattern matching
    rules:
      - no_hardcoded_scores
      - uses_effect_library
    fail_on: error
  - type: ai_semantic # L3: AI validation
    fail_on: warning  # Don't block CI, but flag issues
    cache: true       # Cache AI results by content hash
```

### 5.4 Contract Testing Pattern

**Current:** Test data is loosely defined
```yaml
test_data: "data/test.json"
```

**Alternative:** Contract testing with assertions
```yaml
contracts:
  - name: "high_skill_match"
    input:
      resume: { $ref: "data/senior-developer.json" }
      job: { $ref: "data/backend-engineer.json" }
    assertions:
      - path: "$.score"
        operator: ">="
        value: 0.7
      - path: "$.reasoning"
        operator: "matches"
        value: ".*Python.*"
```

### 5.5 Explicit Inheritance Keyword

**Current:** Implicit inheritance (absence of domain_rules = inherit)
```yaml
adapter.skills:
  # No domain_rules = inherits defaults
```

**Alternative:** Explicit keyword
```yaml
adapter.skills:
  domain_rules: inherit  # Explicit inheritance

adapter.special:
  domain_rules:
    inherit: true  # Inherit AND extend
    additional:
      - id: special_rule
        description: "..."
```

---

## 6. Recommendations

### 6.1 Address Non-Determinism (Priority: Critical)

**Immediate Actions:**
1. Add content-based caching for AI validation results
2. Add `--deterministic` flag that skips AI validation
3. Log AI model version in validation output for reproducibility

**Medium-Term:**
1. Implement RAG to ground AI in actual code context
2. Add confidence scores to AI results
3. Consider ensemble approach (multiple AI calls, majority vote)

**Spec Change:**
```yaml
ai:
  provider: "openai"
  model: "gpt-4o-mini"
  # New fields:
  cache: true                    # Cache by content hash
  confidence_threshold: 0.8      # Require high confidence
  fallback: "warning"            # What to do on low confidence
```

### 6.2 Adopt JSON Schema for Entities (Priority: High)

**Spec Change:**
```yaml
domain:
  entities:
    score_result:
      # Option 1: Inline JSON Schema
      schema:
        type: object
        properties: { ... }

      # Option 2: Reference external schema
      $ref: "./schemas/score_result.json"

      # Option 3: Backwards compatible - fields as shorthand
      fields: [score, reasoning]  # Generates simple schema
```

### 6.3 Add Specification Versioning (Priority: High)

**Spec Change:**
```yaml
$schema: "https://blocks.ai/schema/v1.0.0"  # Or local reference
name: "HR Recommendation Engine"
```

**Migration Strategy:**
1. v0.x → v1.0: No breaking changes, just add version field
2. Future versions: Automated migration tooling

### 6.4 Clarify Validator IDs (Priority: Medium)

**Option 1:** Use consistent naming
```yaml
validators:
  - schema           # Just "schema", no ".io"
  - shape            # Just "shape", no ".ts" or ".exports.ts"
  - domain           # Consistent
```

**Option 2:** Always use full IDs
```yaml
validators:
  - schema.io
  - shape.exports
  - domain.semantic
```

### 6.5 Add $ref Support (Priority: Medium)

**Spec Change:**
```yaml
domain:
  entities:
    resume:
      $ref: "https://jsonresume.org/schema/v1.0.0"

blocks:
  adapter.skills:
    $ref: "./blocks/adapter-template.yml"
    overrides:
      description: "Skills scoring adapter"
```

### 6.6 Formalize Test Contracts (Priority: Medium)

**Spec Change:**
```yaml
blocks:
  adapter.skills:
    test:
      fixtures:
        - name: "perfect_match"
          input: { $ref: "fixtures/perfect_match.json" }
          expect:
            score: { $gte: 0.9 }
            reasoning: { $contains: "all required skills" }
        - name: "no_match"
          input: { $ref: "fixtures/no_match.json" }
          expect:
            score: { $lte: 0.3 }
```

### 6.7 Add Static Analysis Rules (Priority: Low)

**Spec Change:**
```yaml
validators:
  - type: static
    rules:
      - id: no_any_types
        pattern: ": any"
        message: "Avoid 'any' type"
        severity: warning
      - id: effect_usage
        ast:
          imports: ["effect"]
          calls: ["Effect.gen", "Effect.tryPromise"]
        severity: error
```

---

## 7. Research References

### Domain-Driven Design & Validation

1. [Microsoft: Designing validations in the domain model layer](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations) - Comprehensive guide on DDD validation patterns

2. [Enterprise Craftsmanship: Specification Pattern vs Always-Valid Domain Model](https://enterprisecraftsmanship.com/posts/specification-pattern-always-valid-domain-model/) - When to use specification pattern

3. [Enterprise Craftsmanship: Validation and DDD](https://enterprisecraftsmanship.com/posts/validation-and-ddd/) - Validation placement in DDD

4. [DEV Community: Simplifying Business Rules with Specification Pattern](https://dev.to/horse_patterns/simplifying-business-rules-with-the-specification-pattern-4o4o) - Practical specification pattern examples

### AI Code Analysis

5. [Awesome-Code-LLM (GitHub)](https://github.com/codefuse-ai/Awesome-Code-LLM) - Curated list of LLM code analysis research

6. [LLMs for Source Code Analysis (arXiv 2025)](https://arxiv.org/html/2503.17502v1) - Comprehensive survey of LLM applications

7. [Best LLM Code Comprehension Tools 2025 (Byteable)](https://www.byteable.ai/blog/best-llm-powered-code-comprehension-tool-2025/) - Commercial tool comparison

8. [AI-Powered Code Reviews 2025 (Medium)](https://medium.com/@API4AI/ai-powered-code-reviews-2025-key-llm-trends-shaping-software-development-eac78e51ee59) - Industry trends

### Specification Design

9. [Specmatic: Unifying OpenAPI & AsyncAPI](https://specmatic.io/appearance/unifying-openapi-asyncapi-designing-json-schemas/) - Best practices for API specifications

10. [AsyncAPI: Using JSON Schema Beyond Validation](https://www.asyncapi.com/blog/json-schema-beyond-validation) - Advanced schema patterns

11. [Apidog: JSON Schema vs OpenAPI](https://apidog.com/blog/son-schema-vs-openapi/) - When to use which

12. [Salesforce: AsyncAPI and OpenAPI Modeling Approach](https://engineering.salesforce.com/asyncapi-and-openapi-an-api-modeling-approach-db9873695910/) - Real-world specification patterns

### Validation Approaches

13. [Dynamic Architecture Validation (Dynatrace)](https://www.dynatrace.com/resources/ebooks/javabook/employing-dynamic-architecture-validation/) - Runtime validation patterns

14. [Development Time vs Runtime (Medium)](https://medium.com/geekculture/development-time-vs-build-time-vs-runtime-a4ff8ce6f735) - When validation should occur

15. [Architectural Runtime Verification (ResearchGate)](https://www.researchgate.net/publication/333067913_Architectural_Runtime_Verification) - Academic research on validation timing

---

## Appendix A: HR Recommendation Example Analysis

### What Works Well

1. **Clear Separation of Concerns**
   - Each adapter handles one dimension (skills, experience, education)
   - Recommendation orchestrator synthesizes results
   - Clean data flow through Effect.all()

2. **Comprehensive Domain Rules**
   - EEOC compliance awareness
   - US market calibration
   - Academic prompt engineering

3. **Custom Output Validator**
   - Runtime validation of actual AI outputs
   - Specific, testable assertions
   - Good error messages

### What Could Improve

1. **Entity Definitions Are Too Simple**
   ```yaml
   entities:
     resume:
       fields: [basics, work, education, skills, certifications, projects]
   ```
   No indication of field types, optionality, or nested structure.

2. **Signals Are Unused**
   ```yaml
   signals:
     skill_alignment:
       description: "How well candidate skills match job requirements"
   ```
   Signals are defined but never referenced in blocks or validation.

3. **Effect Coupling**
   - Every adapter returns `Effect.Effect<T, Error>`
   - Philosophy enforces Effect usage
   - Limits portability to non-Effect codebases

---

## Appendix B: Specification Comparison Matrix

| Feature | Blocks | OpenAPI 3.1 | AsyncAPI 3.0 | JSON Schema |
|---------|--------|-------------|--------------|-------------|
| Version field | No | Yes | Yes | Yes ($schema) |
| $ref support | No | Yes | Yes | Yes |
| Type system | Simple | JSON Schema | JSON Schema | Full |
| Composition | No | allOf/oneOf | allOf/oneOf | Full |
| Extensibility | Custom validators | x- prefix | x- prefix | vocabularies |
| Tooling ecosystem | Minimal | Extensive | Growing | Extensive |
| AI integration | Native | None | None | None |
| Domain modeling | Native | Via extensions | Via extensions | None |
| Philosophy/values | Native | None | None | None |

---

## Appendix C: Suggested blocks.yml v2.0 Schema

```yaml
# Versioned schema
$schema: "https://blocks.ai/schema/v2.0.0"

name: "HR Recommendation Engine"
root: "adapters"

# Philosophy unchanged - this is a unique strength
philosophy:
  - "Scoring adapters must provide objective evaluations"

# Enhanced domain with JSON Schema support
domain:
  entities:
    resume:
      $ref: "https://jsonresume.org/schema/v1.0.0"
    score_result:
      schema:
        type: object
        properties:
          score: { type: number, minimum: 0, maximum: 1 }
          reasoning: { type: string, minLength: 50 }
        required: [score, reasoning]

  # Signals with concrete extraction rules
  signals:
    skill_alignment:
      description: "How well candidate skills match"
      extract:
        type: comparison
        source: "resume.skills[*].name"
        target: "job.required_skills"

  # Measures with executable constraints
  measures:
    score_0_1:
      schema:
        type: number
        minimum: 0
        maximum: 1

# Enhanced blocks with explicit inheritance
blocks:
  domain_rules:
    - id: objective_scoring
      description: "Based on objective criteria"
      severity: error

  adapter.skills:
    description: "Skills scoring adapter"
    domain_rules: inherit  # Explicit
    inputs:
      - name: resume
        type: entity.resume
    outputs:
      - name: result
        type: entity.score_result
        measures: [score_0_1]
    test:
      fixtures:
        - input: { $ref: "fixtures/skills-test.json" }
          expect:
            score: { $gte: 0 }

# Enhanced validators with explicit types
validators:
  - type: schema
    fail_on: error
  - type: static
    rules: [no_any_types]
    fail_on: warning
  - type: ai_semantic
    fail_on: warning
    cache: true

# Enhanced AI config
ai:
  provider: "openai"
  model: "gpt-4o-mini"
  cache: true
  confidence_threshold: 0.8
```

---

*End of Analysis*
