# Domain Modeling

Blocks is inspired by Cube.dev, Malloy, and PDDL. It treats domain concepts as first-class, executable artifacts.

## Core Concepts

### Entities

Entities are the "things" in your domain.

```yaml
domain:
  entities:
    candidate:
      fields: [skills, experience, industry, values]

    job:
      fields: [skills_required, culture, seniority]

    location:
      fields: [city, country_code]
```

Blocks can reference entities via `entity.<name>` types:

```yaml
blocks:
  my_block:
    inputs:
      - name: candidate
        type: entity.candidate
```

### Signals

Signals are **domain-specific concepts** extracted from entities.

```yaml
domain:
  signals:
    civic_mindedness:
      description: "How community-oriented is the candidate?"
      extraction_hint: "Look for volunteer work, activism, community roles."

    culture_fit:
      description: "Behavioral & values alignment."
      extraction_hint: "Compare candidate values with job culture."
```

Signals guide AI-powered validators and give semantic meaning to data.

### Measures

Measures are **constraints on output values**.

```yaml
domain:
  measures:
    score_0_1:
      constraints:
        - "Value must be between 0 and 1."
        - "Expresses normalized score."

    spanish_quality:
      constraints:
        - "Output must be Spanish."
        - "Check via translation chain."
```

Blocks can reference measures via `measure.<name>`:

```yaml
blocks:
  my_block:
    outputs:
      - name: civic_score
        type: measure.score_0_1
```

## Domain Rules

Blocks can have **domain-specific validation rules**:

```yaml
blocks:
  civic_mindedness:
    domain_rules:
      - id: must_use_values
        description: "Civic score must reference candidate values or volunteerism."
```

The domain validator uses these rules to check semantic correctness.

## Templates

For template blocks, required sections are defined:

```yaml
templates:
  required_sections:
    - basics
    - work
    - education

blocks:
  template.modern_resume:
    type: template
    sections:
      - basics
      - work
      - education
      - skills
```

Shape validators check that templates include required sections.

## Philosophy

The `philosophy` field captures design principles:

```yaml
philosophy:
  - "Blocks must be small, composable, deterministic."
  - "Blocks must express domain intent clearly in code."
  - "All blocks must validate through multi-layer checks."
```

These are shown to AI agents and developers to guide implementation.

## Domain Drift Detection

When code introduces concepts not in the spec, validators detect it:

```typescript
// Code introduces alerts_es (not in spec)
return {
  description_es,
  alerts_es  // ← detected by domain validator
}
```

Validator output:

```
⚠ [domain] Undocumented output field: alerts_es
→ Suggestion: Add alerts_es to outputs in blocks.yml
```

User approves → Agent updates spec → Re-run → Pass.

## Semantic Validation Flow

1. **Static Analysis** (DomainAnalyzer)
   - Check entities exist
   - Check signals exist
   - Check measures exist
   - Check template sections

2. **AI Validation** (AIProvider)
   - Read block definition
   - Read domain rules
   - Read implementation code
   - Validate semantic alignment
   - Detect undocumented concepts

3. **Drift Detection**
   - Compare detected concepts vs spec
   - Warn about new concepts
   - Suggest spec updates

## Why Domain Modeling Matters

Without domain modeling:
- AI agents hallucinate structures
- Conventions drift over time
- Semantic meaning is lost in code
- No consistency across blocks

With domain modeling:
- Explicit semantics
- Enforced constraints
- Drift detection
- Evolutionary design
- AI agents stay aligned

## Comparison to Other Systems

| System | Purpose | Blocks Equivalent |
|--------|---------|-------------------|
| Cube.dev | BI data modeling | Domain entities + measures |
| Malloy | SQL semantic layer | Domain signals + entities |
| PDDL | AI planning | Domain rules + constraints |
| JSON Schema | Data validation | Schema validators |
| GraphQL | API contracts | Block I/O signatures |

Blocks combines all of these into a unified system for **code semantics**.
