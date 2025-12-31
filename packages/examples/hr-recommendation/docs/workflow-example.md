# Blocks Workflow Example: Changing Market Context

This document demonstrates the Blocks workflow for making domain-level changes to adapters.

## Scenario

We need to change the HR Recommendation Engine from evaluating candidates for **Australian companies** to **American companies**.

## Step 1: Update blocks.yml First

Before touching any code, we update the domain rules in `blocks.yml`:

```yaml
# Before
philosophy:
  - "All evaluations are calibrated for the Australian job market"

blocks:
  domain_rules:
    - id: australian_market
      description: "Evaluations must consider Australian market context..."

# After
philosophy:
  - "All evaluations are calibrated for the American job market"

blocks:
  domain_rules:
    - id: american_market
      description: "Evaluations must consider American market context including US degree equivalencies, work authorization (H-1B, green card, citizenship), EEOC compliance, and US industry standards"
```

## Step 2: Run Validation BEFORE Code Changes

```bash
blocks run --all
```

### Actual Output

```
🧱 Blocks Validator

📦 Validating: adapter.skills
  ✓ schema ok
  ✓ shape.ts ok
  ✗ [domain] SYSTEM_PROMPT and scoring instructions reference the Australian job market
    and industry standards, but domain rules require calibration for the American job
    market including US degree equivalency, work authorization, EEOC compliance, and
    US industry standards.
  ⚠ [domain] Scoring criteria in prompt weights required skills at up to 70% of the score,
    preferred skills at 20%, and skill depth at 10%, which is consistent with block
    constraints, but weighting sum is implied not explicitly stated.
  ✗ [domain] Prompt and scoring logic do not mention handling of missing or incomplete
    data explicitly, which is required by domain rules to handle gracefully.
  ✗ [domain] System prompt and buildPrompt do not instruct or consider critical American
    market context elements such as US degree equivalencies, work authorization status
    (H-1B, green card, citizenship), and EEOC compliance.

  ❌ Block "adapter.skills" has errors

📦 Validating: adapter.experience
  ✓ schema ok
  ✓ shape.ts ok
  ✗ [domain] SYSTEM_PROMPT references 'Australian job market' and 'Australian workplace
    culture', which conflicts with the domain rule requiring calibration for the American
    job market including US degree equivalencies and work authorization.
  ✗ [domain] The prompt and scoring criteria in buildPrompt function do not mention or
    incorporate US-specific factors such as US degree equivalencies, work authorization
    (H-1B, green card, citizenship), or EEOC compliance.
  ⚠ [domain] The scoring criteria weights are given only in prompt text but not enforced
    or validated in the implementation.

  ❌ Block "adapter.experience" has errors

📦 Validating: adapter.education
  ✓ schema ok
  ✓ shape.ts ok
  ✗ [domain] SYSTEM_PROMPT specifies expertise for the Australian job market, which
    conflicts with the domain requirement to calibrate evaluations for the American
    job market, including US degree equivalencies and EEOC compliance.
  ✗ [domain] SYSTEM_PROMPT references Australian Qualifications Framework (AQF) levels
    instead of US educational standards.
  ✗ [domain] The prompt and scoring criteria do not mention consideration of work
    authorization status (H-1B, green card, citizenship).
  ✗ [domain] The buildPrompt uses markdown formatting for education and certifications,
    but output is intended as structured JSON.
  ⚠ [domain] The prompt scoring criteria includes 'Institution quality', but the domain
    rules only require checking degree level, field relevance, and certifications.

  ❌ Block "adapter.education" has errors

📦 Validating: adapter.recommendation
  ✓ schema ok
  ✓ shape.ts ok
  ✗ [domain] System prompt and prompt instructions specify the Australian job market
    context, whereas domain rules require calibration for the American job market,
    including US degree equivalencies, work authorization, and EEOC compliance.
  ⚠ [domain] The prompt constructs decision criteria with weighted scores and defined
    hire decision thresholds, aligning well with domain constraints. However, explicit
    handling of missing or incomplete data is not shown.

  ❌ Block "adapter.recommendation" has errors
```

## Step 3: Review Feedback

The validator identified these issues across all adapters:

| Adapter | Errors | Warnings | Key Issues |
|---------|--------|----------|------------|
| `adapter.skills` | 3 | 1 | Australian job market refs, missing US context |
| `adapter.experience` | 2 | 1 | Australian workplace culture, missing US factors |
| `adapter.education` | 4 | 1 | Uses AQF instead of US degree standards |
| `adapter.recommendation` | 1 | 1 | Australian employment law, not EEOC |

**Common issues flagged:**
- SYSTEM_PROMPT references "Australian job market" instead of "American job market"
- Missing work authorization considerations (H-1B, green card, citizenship)
- Missing EEOC compliance requirements
- Australian Qualifications Framework (AQF) should be US degree equivalencies
- Missing explicit handling of incomplete data

## Step 4: Implement Code Changes

Now we update each adapter based on the validation feedback:

### adapters/skills/skills.ts
```typescript
// Before
const SYSTEM_PROMPT = `You are an expert HR analyst specializing in skills assessment for the Australian job market...`;

// After
const SYSTEM_PROMPT = `You are an expert HR analyst specializing in skills assessment for the American job market.
Consider US industry certifications, technical skill requirements, and American workplace expectations...`;
```

### adapters/experience/experience.ts
```typescript
// Before
const SYSTEM_PROMPT = `...Australian employment practices and industry experience valuations.`;

// After
const SYSTEM_PROMPT = `...US employment practices, at-will employment considerations, and American industry experience valuations.`;
```

### adapters/education/education.ts
```typescript
// Before
const SYSTEM_PROMPT = `...Consider Australian Qualifications Framework (AQF) levels...`;

// After
const SYSTEM_PROMPT = `...Consider US degree equivalencies (Associate's, Bachelor's, Master's, Doctorate) and accreditation standards...`;
```

### adapters/recommendation/recommendation.ts
```typescript
// Before
const SYSTEM_PROMPT = `...Consider Australian employment law, Fair Work requirements, and local hiring practices.`;

// After
const SYSTEM_PROMPT = `...Consider US employment law, EEOC compliance requirements, at-will employment, and American hiring practices.`;
```

## Step 5: Run Validation Again

```bash
blocks run --all
```

### Actual Output After Fixes

```
🧱 Blocks Validator

📦 Validating: adapter.skills
  ✓ schema ok
  ✓ shape.ts ok
  ✓ domain ok

  ✅ Block "adapter.skills" passed all validations

📦 Validating: adapter.experience
  ✓ schema ok
  ✓ shape.ts ok
  ✓ domain ok

  ✅ Block "adapter.experience" passed all validations

📦 Validating: adapter.education
  ✓ schema ok
  ✓ shape.ts ok
  ✓ domain ok

  ✅ Block "adapter.education" passed all validations

📦 Validating: adapter.recommendation
  ✓ schema ok
  ✓ shape.ts ok
  ✓ domain ok

  ✅ Block "adapter.recommendation" passed all validations
```

**Result: 0 errors, 0 warnings across all 4 adapters.**

## Key Takeaways

1. **Domain-first approach**: Change `blocks.yml` before touching code
2. **Validation guides implementation**: Run validation to get specific feedback
3. **Targeted changes**: Validator tells you exactly which files/lines need updates
4. **Confidence on completion**: Re-run validation to confirm compliance

## Why This Workflow Matters

- **Prevents drift**: Domain rules are the source of truth
- **Provides guardrails**: AI validates semantic intent, not just syntax
- **Enables iteration**: Make incremental changes with immediate feedback
- **Documents intent**: `blocks.yml` captures business requirements explicitly

---

*This workflow was tested on the HR Recommendation Engine example transitioning from Australian to American market context.*
