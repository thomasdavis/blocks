# Claude Code Integration Guide

This document explains how Claude Code (and other AI coding assistants) should work with Blocks.

## Overview

Blocks provides a **negotiation layer** for human-AI collaboration by:

- Explicit domain semantics
- Multi-layer validation feedback
- Drift detection and resolution
- Spec evolution

Both humans and AI agents write code freely. Blocks validates the result and reports drift, helping you decide whether to fix code or update the spec.

## Core Philosophy: Humans and Agents Both Write Code

**CRITICAL:** Blocks does NOT restrict who can edit module code.

- ✅ Humans can write and modify any block
- ✅ AI agents can write and modify any block
- ✅ Blocks detects when either introduces drift
- ✅ You decide: fix code or update spec

**Not a restriction** - a recovery mechanism for consistency.
**Not enforcing rules** - helping you reason about drift.
**Not locking down code** - giving you a semantic compass.

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

When working on projects with many blocks (e.g., 100+ utility blocks, 100+ templates):

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
  civic_mindedness:
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

## Development Philosophy: How to Build Blocks

This section documents critical architectural decisions and development patterns learned while building Blocks.

### Core Principle: Development-Time vs Runtime Validation

**CRITICAL:** Blocks is fundamentally a **development-time validator**, not a runtime validator.

#### What This Means

**Development-Time (Where Blocks Lives):**
- Validate SOURCE CODE during development
- AI analyzes template files, implementation files, all block files
- Provide semantic feedback to guide iterative improvement
- Goal: Ensure code is correct BEFORE deployment

**Runtime (Application Layer):**
- Validate INPUT DATA only (required fields, valid formats)
- NO validation of template compliance
- NO parsing of output to check domain rules
- Trust that validated source code produces correct output

#### Why This Matters

Templates are **deterministic**:
```
Same input → Same template → Same output
```

If `template.hbs` source passes validation during development, it will ALWAYS produce compliant HTML at runtime. No need to validate the output every time.

**Wrong Approach (Runtime Validation):**
```typescript
export function theme(resume: Resume) {
  const html = template(resume);

  // ❌ DON'T parse output at runtime
  if (!html.includes('<header>')) throw new Error(...);
  if (!html.includes('aria-label')) throw new Error(...);
  // ... 170 lines of HTML parsing every render

  return { html };
}
```

**Correct Approach (Development-Time Validation):**
```typescript
// Block implementation (~20 lines)
export function theme(resume: Resume) {
  // ✓ Validate input data only
  if (!resume.basics?.name) {
    throw new Error("Resume must include name");
  }

  // ✓ Render and trust template (validated at dev time)
  return { html: template(resume) };
}

// Validation happens when you run: blocks run theme.modern_professional
// Domain validator reads template.hbs SOURCE and analyzes it with AI
```

### Domain Validator Reads ALL Files

The domain validator doesn't just read `block.ts` - it reads **every file in the block directory**.

#### How It Works

1. Recursively read all files in block path
2. Exclude build artifacts (node_modules, dist, .git)
3. Pass ALL files to AI with full context
4. AI analyzes everything together

#### Why This Is Better

- **Complete context** - AI sees templates, styles, utilities, everything
- **Flexible structure** - Works with any project organization
- **Holistic validation** - AI understands how files relate
- **Future-proof** - Handles blocks with multiple components

#### Example

```
themes/modern-professional/
├── block.ts          # Implementation
├── template.hbs      # Handlebars template
├── index.ts          # Exports
└── utils.ts          # Helper functions

Domain validator reads ALL 4 files and passes to AI:

"Here are ALL the files for theme.modern_professional:

--- block.ts ---
```typescript
export function modernProfessionalTheme(resume: Resume) {
  // implementation
}
```

--- template.hbs ---
```handlebars
<header role="banner">
  <h1>{{basics.name}}</h1>
```

--- index.ts ---
```typescript
export { modernProfessionalTheme } from './block.js';
```

Analyze ALL files together for domain compliance..."
```

### Keep Block Implementations Simple

**Target: 20-50 lines** for most blocks.

#### What Belongs in Block Implementations

✅ **DO include:**
- Input data validation (required fields exist)
- Business logic
- Template rendering / computation
- Output generation
- Error handling

❌ **DON'T include:**
- Validation of template compliance
- Parsing output to check domain rules
- Runtime enforcement of semantic HTML
- Checking for ARIA labels in rendered HTML
- Any logic that duplicates what validators do

#### Before vs After Example

**Before (250 lines):**
```typescript
export function modernProfessionalTheme(resume: Resume) {
  // 40 lines of input validation
  if (!resume.basics) throw new Error(...);
  if (!resume.work) throw new Error(...);
  if (!resume.education) throw new Error(...);
  if (!resume.skills) throw new Error(...);

  const html = template(resume);

  // 170 lines of runtime HTML validation
  validateSemanticHTML(html);
  validateAccessibility(html);
  validateResponsiveDesign(html);
  validateVisualHierarchy(html);

  return { html };
}

function validateSemanticHTML(html: string) {
  // 30 lines parsing HTML...
}

function validateAccessibility(html: string) {
  // 40 lines checking ARIA...
}

function validateResponsiveDesign(html: string) {
  // 50 lines checking media queries...
}

function validateVisualHierarchy(html: string) {
  // 50 lines checking typography...
}
```

**After (20 lines):**
```typescript
/**
 * Domain compliance enforced at development time by Blocks validator.
 * Validator analyzes template.hbs source for semantic HTML, ARIA, responsiveness.
 */
export function modernProfessionalTheme(resume: Resume, config?: ThemeConfig) {
  // Input validation only
  if (!resume.basics?.name || !resume.basics?.label) {
    throw new Error("Resume must include basics.name and basics.label");
  }

  // Render and return
  const html = template(resume);
  return { html };
}
```

### Project Structure Flexibility

Users can organize their projects however they want using the `path` field in blocks.yml.

#### Default Structure (If No Path)

```yaml
blocks:
  my_block:
    description: "My block description"
    # No path specified
```

Blocks looks in: `blocks/my_block/` (or whatever `targets.discover.root` is set to)

#### Custom Structure (With Path)

```yaml
blocks:
  theme.modern_professional:
    description: "Modern professional resume theme"
    path: "themes/modern-professional"  # Custom location!
```

Blocks looks in: `themes/modern-professional/` directly

#### Why This Matters

Users aren't forced into a specific folder structure. They can:
- Put templates in `themes/`
- Put utilities in `lib/`
- Put validators in `validators/`
- Organize by feature, not by "blocks"

The `path` field respects user's project organization.

### Test Data Configuration

Blocks supports flexible test data for validation.

#### Option 1: External File (Recommended)

```yaml
blocks:
  theme.modern_professional:
    test_data: "test-data/sample-resume.json"
```

Good for: Large, realistic datasets

#### Option 2: Inline Samples

```yaml
blocks:
  calculate_score:
    test_samples:
      - { user: { id: 1, name: "Alice" } }
      - { user: { id: 2, name: "Bob" } }
```

Good for: Simple data, quick tests

#### Option 3: Both

```yaml
blocks:
  theme.modern_professional:
    test_data: "test-data/sample-resume.json"  # Main dataset
    test_samples:  # Edge cases
      - { basics: { name: "Minimal" } }
```

**Note:** In current version, test_data is defined in schema but not yet used by validators. Future feature for output validators.

### AI Validation Context

The AI receives comprehensive context about Blocks philosophy and domain concepts.

#### What AI Knows

When validating, the AI prompt includes:

1. **Blocks Philosophy** (from blocks.yml):
   ```
   - "Resume themes must prioritize readability and professionalism."
   - "All themes must be responsive and accessible."
   ```

2. **Domain Concepts**:
   ```
   - Entities: Core data types (e.g., resume, user)
   - Signals: Domain concepts to extract (e.g., readability)
   - Measures: Constraints on outputs (e.g., valid_html)
   ```

3. **ALL Block Files**:
   ```
   --- block.ts ---
   [full source code]

   --- template.hbs ---
   [full template source]

   --- index.ts ---
   [exports]
   ```

4. **Domain Rules**:
   ```
   - Must use semantic HTML tags (header, main, section, article)
   - Must include proper ARIA labels and semantic structure
   ```

5. **Validation Instructions**:
   ```
   Analyze ALL files together to determine if this block:
   1. Expresses domain intent clearly in source code
   2. Uses specified inputs/outputs correctly
   3. Adheres to all domain rules
   4. For templates: Check template SOURCE for semantic HTML
   5. Does NOT introduce undocumented concepts
   ```

This comprehensive context helps AI provide intelligent, domain-aware feedback.

### Separation of Concerns

Clear boundaries between what blocks do vs what validators do.

#### Block Responsibility

- Implement business logic
- Validate input data
- Render output
- Handle errors
- ~20-50 lines typical

#### Validator Responsibility

- Analyze source code
- Check domain compliance
- Verify semantic alignment
- Detect drift
- Provide feedback

**Key Rule:** Blocks implement, validators validate. No overlap.

### Development Workflow

When building features for Blocks:

#### 1. Start with Architecture

Before coding, ask:
- Is this development-time or runtime?
- Does this validate source or output?
- Should this be in the block or a validator?
- Are we trusting validated code?

#### 2. Keep Validators Separate

Validators are in `packages/validators/`, not in block implementations.

#### 3. Test Both Layers

- **Development validation:** Run `blocks run <name>` with test data
- **Runtime behavior:** Unit tests for block logic
- **Integration:** End-to-end with real data

#### 4. Document Decisions

When making architectural choices, document them:
- In code comments
- In CLAUDE.md (this file)
- In docs/validators-architecture.md
- In commit messages

### Common Mistakes to Avoid

#### ❌ Runtime Validation of Template Compliance

```typescript
// DON'T do this
export function theme(resume: Resume) {
  const html = template(resume);
  if (!html.includes('<header>')) {
    throw new Error("Missing header tag");
  }
  return { html };
}
```

**Why wrong:** Template is deterministic. If it passes dev-time validation, it's correct.

#### ❌ Parsing Output for Domain Rules

```typescript
// DON'T do this
const hasAriaLabels = html.match(/aria-label/g)?.length >= 3;
if (!hasAriaLabels) {
  throw new Error("Need more ARIA labels");
}
```

**Why wrong:** This is what the domain validator does by analyzing SOURCE, not output.

#### ❌ Validating Only block.ts

```typescript
// In domain validator - DON'T do this
const code = readFileSync(join(blockPath, 'block.ts'), 'utf-8');
await ai.validate({ code });  // ❌ Missing template!
```

**Why wrong:** Need to read ALL files to give AI complete context.

#### ❌ Forcing Specific Folder Structure

```typescript
// DON'T do this
const blockPath = join('blocks', blockName);  // ❌ Hardcoded!
```

**Why wrong:** Users can organize projects however they want. Respect the `path` field.

### Success Patterns

#### ✅ Simple Block Implementation

```typescript
export function theme(resume: Resume) {
  if (!resume.basics?.name) {
    throw new Error("Resume must include name");
  }
  return { html: template(resume) };
}
```

**Why right:** Simple, focused, trusts validated template.

#### ✅ Read All Files in Validator

```typescript
const blockFiles = readAllBlockFiles(context.blockPath);
await ai.validateDomainSemantics({
  files: blockFiles,  // ✓ All files!
  philosophy: context.config.philosophy,
  domainRules,
});
```

**Why right:** Complete context for AI analysis.

#### ✅ Respect Custom Paths

```typescript
const blockPath = block.path
  ? join(process.cwd(), block.path)
  : join(process.cwd(), discoverRoot, blockName);
```

**Why right:** Flexible, respects user's project structure.

#### ✅ Validate Source, Not Output

```typescript
// In AI prompt
"For templates: Check template SOURCE for semantic HTML tags.
Do NOT execute or render - analyze the SOURCE CODE."
```

**Why right:** Source is deterministic, that's what matters.

### Future Directions

As Blocks evolves:

#### Output Validators (Coming Soon)

Will render with test data and validate output:
```yaml
validators:
  output:
    - id: html_structure
      run: "output.html.v1"
```

Use case: Checking generated output structure, link validation, etc.

#### Visual Validators (Future)

Screenshot-based validation with vision models:
```yaml
validators:
  visual:
    - id: contrast_check
      run: "visual.contrast.v1"
```

Use case: WCAG color contrast, visual hierarchy, responsive layout testing.

#### Progressive Validation

Validate incrementally as you code, not just on save.

#### Auto-Healing

AI proposes fixes for validation failures, not just feedback.

### Key Takeaways for Development

When building Blocks features:

1. **Think layers** - Development-time vs runtime, source vs output
2. **Keep blocks simple** - Aim for 20-50 lines
3. **Validators validate** - Don't put validation logic in blocks
4. **Read all files** - Domain validator needs complete context
5. **Respect flexibility** - Users organize projects their way
6. **Trust validated code** - If source passes dev validation, trust it
7. **Document decisions** - Architecture choices are critical
8. **Test both layers** - Dev-time validation AND runtime behavior

---

**Remember:** Blocks is a framework for **agentic coding with guardrails**. The spec is your guide, validators are your feedback, and evolution is your goal.

**Critical:** Validate SOURCE CODE at development time. Trust validated code at runtime.
