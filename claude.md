# Claude Code Integration Guide

This document explains how Claude Code (and other AI coding assistants) should work with Blocks.

## Overview

Blocks is designed to guide agentic coding workflows by providing:

- Explicit domain semantics
- Multi-layer validation feedback
- Iterative improvement loops
- Spec evolution

## Core Workflow

### 1. Always Read blocks.yml First

Before creating or modifying any block, read `blocks.yml` to understand:

- Domain entities, signals, and measures
- Block definitions (inputs, outputs, constraints)
- Domain rules
- Philosophy statements
- Validation pipeline

```typescript
// Example: Reading blocks.yml in Claude Code workflow
const config = await readFile("blocks.yml");
// Parse and understand the domain...
```

### 2. Write Code According to Spec

When implementing a block:

- Use the defined inputs/outputs
- Reference domain entities via `entity.<name>`
- Return outputs that match measure constraints
- Follow domain rules
- Express domain intent clearly in code

### 3. Run Validation After Changes

**ALWAYS** run the Blocks CLI after making changes:

```bash
blocks run <block-name>
```

Or for all blocks:

```bash
blocks run --all
```

### 4. Interpret Validator Output as Instructions

Validator output is **not just feedback** — it's **instructions for what to fix**.

Example output:

```
📦 Validating: get_weather_and_translate

  ✓ schema ok
  ✓ shape ok

  ⚠ [domain] Missing mention of condition in output
  → Suggestion: Ensure description_es includes weather condition

  ⚠ [domain] Output too short for natural Spanish description
  → Suggestion: Expand the description to be more natural

  ❌ Block "get_weather_and_translate" has warnings
```

**What to do:**

1. Fix the domain issues (add condition mention, expand description)
2. Re-run `blocks run get_weather_and_translate`
3. Repeat until all checks pass

### 5. Handle Domain Drift

When you introduce a new concept not in the spec:

```typescript
// You write this:
return {
  description_es: "...",
  alerts_es: ["alert1", "alert2"]  // ← NEW concept
}
```

Validator detects it:

```
⚠ [domain] Undocumented output field: alerts_es
→ Suggestion: Add alerts_es to outputs in blocks.yml
```

**What to do:**

1. Ask the user: "Should I add `alerts_es` to the spec?"
2. If yes, update `blocks.yml`:

```yaml
outputs:
  - name: alerts_es
    type: string[]
    measures: [spanish_quality]
    constraints:
      - "Must be Spanish"
```

3. Re-run validation
4. Should now pass

## Example: Full Weather Block Workflow

### Step 1: Read blocks.yml

```yaml
blocks:
  get_weather_and_translate:
    type: utility
    description: "Fetch weather & output Spanish description."
    inputs:
      - name: location
        type: entity.location
    outputs:
      - name: description_es
        type: string
        measures: [spanish_quality]
        constraints:
          - "Must mention temperature"
          - "Must mention condition"
          - "Must mention city"
```

### Step 2: Write Implementation

```typescript
// blocks/get_weather_and_translate/block.ts
export async function getWeatherAndTranslate(location: { city: string; country_code: string }) {
  const weather = await fetchWeather(location);

  return {
    description_es: `En ${location.city}: ${weather.temp_c}°C y ${weather.condition}.`
  };
}
```

### Step 3: Run Validation

```bash
blocks run get_weather_and_translate
```

### Step 4: See Output

```
⚠ [domain] description_es does not mention condition in all cases
⚠ [translation] Spanish quality score: 0.78 (below threshold)
```

### Step 5: Fix Issues

```typescript
export async function getWeatherAndTranslate(location: { city: string; country_code: string }) {
  const weather = await fetchWeather(location);

  const condition = translateCondition(weather.condition);

  return {
    description_es: `En ${location.city}, la temperatura es de ${weather.temp_c}°C con ${condition}.`
  };
}
```

### Step 6: Re-run

```bash
blocks run get_weather_and_translate
```

```
✓ schema ok
✓ shape ok
✓ domain ok
✓ translation ok

✅ Block "get_weather_and_translate" passed all validations
```

## Validation Loop Pattern

```
┌─────────────────────────────────────┐
│ 1. Read blocks.yml                  │
└──────────┬──────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 2. Write/modify code                │
└──────────┬──────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 3. Run: blocks run <name>           │
└──────────┬──────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 4. Check validation output          │
└──────────┬──────────────────────────┘
           ↓
        Pass? ──Yes──→ ✅ Done
           ↓
          No
           ↓
┌─────────────────────────────────────┐
│ 5. Fix issues from validator output │
└──────────┬──────────────────────────┘
           ↓
        (loop back to step 3)
```

## Multi-Block Projects

When working on projects with many blocks (e.g., 100+ facets, 100+ templates):

### Strategy 1: Generate in Batches

```bash
# Generate 10 blocks
# Then validate all
blocks run --all
```

### Strategy 2: Validate Incrementally

```bash
# After each block
blocks run <block-name>
```

### Strategy 3: Use Domain Rules

Define domain rules to catch common mistakes:

```yaml
blocks:
  facet.civic_mindedness:
    domain_rules:
      - id: must_use_values
        description: "Civic score must reference candidate values or volunteerism."
```

Domain validator will check these rules.

## Understanding Validator Types

1. **Schema** - Fast, deterministic (I/O types)
2. **Shape** - Fast, deterministic (file structure)
3. **Domain** - Slow, AI-powered (semantic alignment)
4. **Lint** - Medium, deterministic (code quality) [coming soon]
5. **Chain** - Multi-step pipelines [coming soon]
6. **Shadow** - Advisory only (doesn't block) [coming soon]
7. **Scoring** - Metrics for dashboards [coming soon]

## AI Provider Configuration

Blocks uses Vercel AI SDK v6 with OpenAI for semantic validation.

Set your API key:

```bash
export OPENAI_API_KEY="sk-..."
```

Or configure in code (for library usage):

```typescript
import { AIProvider } from "@blocks/ai";

const ai = new AIProvider({
  apiKey: "sk-...",
  model: "gpt-4o-mini"  // or gpt-4o
});
```

## Best Practices

### DO:

- ✅ Always read `blocks.yml` before coding
- ✅ Run validators after every change
- ✅ Treat validator output as instructions
- ✅ Ask user before modifying spec
- ✅ Express domain intent clearly in code

### DON'T:

- ❌ Skip validation steps
- ❌ Ignore warnings
- ❌ Modify spec without user approval
- ❌ Introduce concepts without documenting them
- ❌ Write code that "tricks" validators

## Philosophy Alignment

Blocks philosophy (from `blocks.yml`):

1. "Blocks must be small, composable, deterministic."
2. "Blocks must express domain intent clearly in code."
3. "All blocks must validate through multi-layer checks."
4. "Spec and implementation must evolve together."

Your code should embody these principles.

## Troubleshooting

### Validation fails with "AI validation failed"

- Check that `OPENAI_API_KEY` is set
- Check API quota/rate limits
- Try again (AI validation can be flaky)

### Domain validator says "undocumented concept"

- This is **drift detection**
- Ask user if concept should be added to spec
- If yes, update `blocks.yml`
- Re-run validation

### Shape validator fails

- Check that `index.ts` and `block.ts` exist
- Check that exports are present
- Follow file structure conventions

## Integration with Claude Code

When using this repo with Claude Code:

1. Claude reads this file (`claude.md`)
2. Claude reads `blocks.yml`
3. Claude implements blocks
4. Claude runs `blocks run <name>`
5. Claude interprets output
6. Claude fixes issues
7. Claude proposes spec updates (if needed)

This creates a **semantic feedback loop** where the agent learns domain constraints through validation.

## Advanced: Custom Validators

You can create custom validators:

```typescript
import { Validator, ValidatorContext, ValidationResult } from "@blocks/validators";

export class CustomValidator implements Validator {
  id = "custom.my_validator.v1";

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    // Your validation logic
    return {
      valid: true,
      issues: []
    };
  }
}
```

Add to pipeline:

```yaml
validators:
  custom:
    - id: my_custom
      run: "custom.my_validator.v1"

pipeline:
  steps:
    - id: custom
      run: "custom.my_validator.v1"
```

---

**Remember:** Blocks is a framework for **agentic coding with guardrails**. The spec is your guide, validators are your feedback, and evolution is your goal.
