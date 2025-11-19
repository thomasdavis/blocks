# Validators Architecture

## Overview

Blocks uses a **multi-layer validation system** to ensure code quality, domain compliance, and semantic correctness. Validators operate at different layers - from source code analysis to runtime execution - providing comprehensive feedback during development.

## Philosophy

**Blocks is fundamentally a development-time framework**, not a runtime validation system. The goal is to guide AI agents and developers to write correct code through semantic feedback loops, not to enforce constraints at runtime.

### Key Principles

1. **Development-time validation** - Catch issues before deployment
2. **Source code analysis** - Validate the source of truth, not outputs
3. **Semantic alignment** - Ensure code expresses domain intent
4. **Iterative refinement** - Provide feedback for continuous improvement
5. **Trust validated code** - If source passes validation, trust its behavior

## Validator Types

### 1. Domain Validators (AI-Powered, Always Active)

**Purpose:** Analyze all source files for semantic alignment with domain specification

**How it works:**
- Reads ALL files in block directory recursively
- Passes complete source code to AI
- AI analyzes with Blocks philosophy context
- Checks domain rules compliance
- Returns specific, actionable feedback

**What it validates:**
- Template source for semantic HTML, ARIA labels, media queries
- Code logic for domain intent expression
- Input/output usage correctness
- Adherence to domain rules
- No undocumented concepts introduced

**Configuration:**
```yaml
validators:
  domain:
    - id: domain_alignment
      run: "domain.validation.v1"
```

**Example feedback:**
```
✓ domain ok - Template uses semantic HTML tags (header, main, section, article)
✓ domain ok - ARIA labels present in template.hbs source
⚠ domain - Missing media query for tablet breakpoint (768px)
```

**Key insight:** Domain validator is INTERNAL to Blocks - always runs, users can override but shouldn't need to.

### 2. Output Validators (User-Defined, Optional)

**Purpose:** Render with test data and validate generated output

**How it works:**
- Execute block function with sample data
- Analyze generated output
- Check output structure, content, format
- Validate against output-specific rules

**When to use:**
- Validating HTML structure after rendering
- Checking generated SQL queries
- Validating API response formats
- Ensuring output meets specific criteria

**Configuration:**
```yaml
blocks:
  theme.modern_professional:
    test_data: "test-data/sample-resume.json"  # Path to test data

validators:
  output:
    - id: html_structure
      run: "output.html.v1"
    - id: link_checker
      run: "output.links.v1"
```

**Example use cases:**
- Verify all links in generated HTML are valid
- Check that generated SQL has proper escaping
- Ensure API responses match OpenAPI spec
- Validate generated images have correct dimensions

**Future implementation** - Not yet built in Blocks core

### 3. Visual Validators (Screenshot-Based, Future)

**Purpose:** Render to screenshot and validate visual appearance

**How it works:**
- Render block output
- Open in headless browser
- Take screenshots at different viewports
- Pass screenshots to vision model
- Validate visual aspects

**What it validates:**
- Color contrast (WCAG compliance)
- Text readability
- Layout integrity
- Visual hierarchy
- Responsive breakpoints actually working

**Configuration:**
```yaml
validators:
  visual:
    - id: contrast_check
      run: "visual.contrast.v1"
      viewports: [320, 768, 1024]
    - id: layout_check
      run: "visual.layout.v1"
```

**Example feedback:**
```
✗ visual - Text contrast ratio 3.2:1 fails WCAG AA (need 4.5:1)
✓ visual - Headings visually distinct at all breakpoints
⚠ visual - Navigation menu overlaps content at 375px width
```

**Status:** Optional core package (@blocksai/visual-validators) - not yet implemented

### 4. Runtime Validators (Production Monitoring, Optional)

**Purpose:** Monitor block behavior in production

**How it works:**
- Sample executions in production
- Track performance metrics
- Monitor error rates
- Detect drift from expected behavior

**When to use:**
- Performance monitoring
- Error tracking
- A/B testing validation
- Production quality assurance

**Not a replacement for development-time validation** - These catch regressions, not design issues.

## Validation Layers: Development vs Runtime

### Development-Time (Where Blocks Lives)

**Goal:** Guide AI agents to write correct code

**Validators:**
- Schema (I/O types match)
- Shape (files exist, structure correct)
- Domain (AI semantic analysis of source)
- Lint (code quality, complexity)

**Process:**
```
1. AI writes template.hbs with semantic HTML
2. Run: blocks run theme.modern_professional
3. Domain validator reads template.hbs source
4. AI analyzes: "Does template use <header>, <main>, <section>?"
5. Feedback: "✓ Semantic HTML found" or "⚠ Missing <article> tags"
6. AI fixes template source
7. Re-validate until compliant
```

**Key insight:** Validate SOURCE, not OUTPUT. Templates are deterministic.

### Runtime (Application Layer)

**Goal:** Handle invalid user data, enforce business rules

**Validation:**
- Input data validation (required fields present)
- Business rule enforcement
- Error handling

**Example:**
```typescript
export function modernProfessionalTheme(resume: Resume) {
  // Runtime validation: DATA validity
  if (!resume.basics?.name) {
    throw new Error("Resume must include name");
  }

  // Render (trust template - it's already validated)
  return { html: template(resume) };
}
```

**What NOT to do at runtime:**
```typescript
// ❌ DON'T parse rendered HTML to check for semantic tags
if (!html.includes('<header>')) { throw new Error(...) }

// ❌ DON'T validate template compliance at runtime
if (!html.includes('aria-label')) { throw new Error(...) }

// ✓ DO validate input data
if (!resume.basics) { throw new Error(...) }
```

## Separation of Concerns

### Block Implementations Should:

✅ Validate input data (required fields, valid formats)
✅ Implement business logic
✅ Render output
✅ Handle errors gracefully
✅ Be simple (~30-50 lines typical)

### Block Implementations Should NOT:

❌ Parse their own output to check compliance
❌ Validate template structure at runtime
❌ Enforce domain rules through runtime checks
❌ Duplicate validator logic

### Validators Should:

✅ Analyze source code for compliance
✅ Check domain rule adherence
✅ Provide specific, actionable feedback
✅ Guide iterative improvement
✅ Validate at development time

### Templates Should Be:

✅ Self-evident (semantic HTML visible in source)
✅ Deterministic (same input → same output)
✅ Validated once (at development time)
✅ Trusted at runtime (if validated, it's correct)

## Test Data Management

Blocks supports flexible test data configuration:

### Option 1: External File (Recommended for Large Datasets)

```yaml
blocks:
  theme.modern_professional:
    test_data: "test-data/sample-resume.json"
```

**Pros:**
- Realistic, complete data
- Can be shared across blocks
- Version controlled separately
- Easy to update

### Option 2: Inline Samples (For Small Data)

```yaml
blocks:
  calculate_score:
    test_samples:
      - { user: { id: 1, name: "Alice" } }
      - { user: { id: 2, name: "Bob" } }
```

**Pros:**
- Self-contained in blocks.yml
- Quick for simple cases
- No external dependencies

### Option 3: Both

```yaml
blocks:
  theme.modern_professional:
    test_data: "test-data/sample-resume.json"
    test_samples:
      - { basics: { name: "Quick Test" } }
```

Use external file for comprehensive validation, inline samples for edge cases.

## Validator Pipeline

Validators run in a specific order for optimal feedback:

```yaml
pipeline:
  name: "complete_validation"
  steps:
    - id: schema
      run: "schema.io.v1"          # Fast, structural
    - id: shape
      run: "shape.exports.v1"       # Fast, file-based
    - id: domain
      run: "domain.validation.v1"   # Slow, AI-powered
    - id: output
      run: "output.html.v1"         # Medium, execution-based
```

**Rationale:**
1. Schema first (fail fast if types wrong)
2. Shape second (fail fast if files missing)
3. Domain third (expensive AI analysis)
4. Output last (requires execution)

## Example: JSON Resume Theme Validation

### Before (Wrong Approach - Runtime Validation)

```typescript
// block.ts - 250 lines
export function modernProfessionalTheme(resume: Resume) {
  if (!resume.basics) throw new Error("Missing basics");
  if (!resume.work) throw new Error("Missing work");

  const html = template(resume);

  // ❌ Runtime HTML parsing (170 lines!)
  validateSemanticHTML(html);
  validateAccessibility(html);
  validateResponsiveDesign(html);
  validateVisualHierarchy(html);

  return { html };
}
```

**Problems:**
- Runtime overhead (parsing HTML every render)
- Wrong layer (validates output, not source)
- Redundant (template already has semantic HTML)
- Violates separation of concerns

### After (Correct Approach - Development-Time Validation)

```typescript
// block.ts - 20 lines
export function modernProfessionalTheme(resume: Resume) {
  // ✓ Runtime: validate DATA only
  if (!resume.basics?.name) {
    throw new Error("Resume must include name");
  }

  // ✓ Render and trust template (validated at dev time)
  return { html: template(resume) };
}
```

**Validation happens in domain validator:**

```
📦 Validating: theme.modern_professional
- Reading all files from: themes/modern-professional/
  Found: block.ts, template.hbs, index.ts
- Analyzing template.hbs source with AI...

✓ schema ok
✓ shape ok
✓ domain ok - Template uses semantic HTML tags (header, main, section, article)
✓ domain ok - ARIA labels found: aria-label="Contact information", aria-labelledby="summary-heading"
✓ domain ok - CSS media queries present: @media (max-width: 768px)
✓ domain ok - Heading hierarchy: h1 (2.5rem), h2 (1.75rem), h3 (1.25rem)

✅ Block "theme.modern_professional" passed all validations
```

**Benefits:**
- Zero runtime overhead
- Validates source (template.hbs is deterministic)
- Simple block implementation
- Correct separation of concerns
- Aligns with Blocks philosophy

## Extending with Custom Validators

Users can create custom validators for specific needs:

```typescript
// my-custom-validator.ts
import { Validator, ValidationResult } from "@blocksai/validators";

export class LinkValidator implements Validator {
  id = "output.links.v1";

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    // Render with test data
    // Extract all links
    // Check if links are valid
    // Return issues
  }
}
```

Register in blocks.yml:

```yaml
validators:
  output:
    - id: check_links
      run: "output.links.v1"
```

## Best Practices

### For Block Developers

1. **Keep blocks simple** - 30-50 lines typical
2. **Validate data, not templates** - Runtime checks for input only
3. **Trust the template** - If validated during development, it's correct
4. **Express intent clearly** - Make domain rules obvious in code
5. **Use semantic source** - Templates should be self-evident

### For Validator Authors

1. **Analyze source, not output** - Validate the source of truth
2. **Provide specific feedback** - "Missing `<header>` tag on line 23"
3. **Reference files** - Point to exact file and location
4. **Be actionable** - Tell developers exactly what to fix
5. **Understand Blocks philosophy** - Development-time guidance

### For AI Agents

1. **Read blocks.yml first** - Understand domain before coding
2. **Run validators after changes** - `blocks run <name>`
3. **Treat output as instructions** - Fix exactly what validators report
4. **Iterate until green** - Don't stop at warnings
5. **Learn from feedback** - Understand why issues are raised

## Future Directions

### Planned Features

- **Output validators** - Built-in HTML, JSON, SQL validators
- **Visual validators** - Screenshot-based validation (@blocksai/visual-validators)
- **Lint validators** - Code complexity, security scanning
- **Chain validators** - Multi-step validation pipelines
- **Shadow validators** - Advisory only (don't block)
- **Scoring validators** - Quality metrics dashboard

### Research Areas

- **Semantic drift detection** - Identify when code diverges from spec
- **Auto-healing** - AI proposes fixes for validation failures
- **Progressive validation** - Validate incrementally during coding
- **Visual regression** - Detect unintended visual changes

## Summary

Blocks validators operate at **multiple layers** to ensure code quality:

1. **Domain (AI, always active)** - Semantic analysis of ALL source files
2. **Output (user-defined, optional)** - Execution-based validation
3. **Visual (future)** - Screenshot validation with vision models
4. **Runtime (optional)** - Production monitoring

**The key principle:** Validate source code at development time, trust validated code at runtime.

This architectural separation ensures:
- ✅ Simple block implementations
- ✅ Zero runtime overhead
- ✅ Comprehensive development feedback
- ✅ Clear separation of concerns
- ✅ Semantic guidance for AI agents

**Remember:** Blocks is not a runtime validator - it's a development-time semantic feedback system for agentic coding.
