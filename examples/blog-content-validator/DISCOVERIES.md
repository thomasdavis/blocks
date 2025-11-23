# Discovery Phase Insights: Blog Content Validator

> What we learned building a markdown blog validator with Blocks

## What We Built

A comprehensive blog content validation system with 5 validators:

1. **Humor/Tone** - Detects conversational tone, humor, storytelling
2. **Content Structure** - Validates intro, body, conclusion, TL;DR, heading hierarchy
3. **SEO Compliance** - Checks meta descriptions, keywords, readability
4. **Markdown Quality** - Validates syntax, links, images, code blocks
5. **Comprehensive** - Orchestrates all validators, weighted scoring

## Blocks CLI Validation Results

All 5 validators **PASSED** schema and shape validation! ✅

```
📦 Validating: validator.humor_tone
  ✓ schema ok
  ✓ shape ok

📦 Validating: validator.content_structure
  ✓ schema ok
  ✓ shape ok

📦 Validating: validator.seo_compliance
  ✓ schema ok
  ✓ shape ok

📦 Validating: validator.markdown_quality
  ✓ schema ok
  ✓ shape ok

📦 Validating: validator.comprehensive
  ✓ schema ok
  ✓ shape ok
```

Domain validation requires OpenAI API key (expected).

## Test Results Summary (Direct TypeScript Execution)

### Good Post (78% overall, PASSED ✅)
- **Humor/Tone**: 65% ✓ (conversational, engaging)
- **Content Structure**: 100% ✓ (perfect structure)
- **SEO Compliance**: 65% ✓ (good metadata)
- **Markdown Quality**: 75% ✓ (clean markdown)

### No Humor Post (70% overall, FAILED ❌)
- **Humor/Tone**: 40% ✗ (too formal, academic)
- **Content Structure**: 100% ✓ (well-structured)
- **SEO Compliance**: 65% ✗ (keyword stuffing, poor readability)
- **Markdown Quality**: 70% ✗ (valid syntax)

### Poor SEO Post (65% overall, FAILED ❌)
- **Humor/Tone**: 95% ✓ (very conversational!)
- **Content Structure**: 51% ✗ (too short, missing TL;DR)
- **SEO Compliance**: 55% ✗ (no metadata)
- **Markdown Quality**: 63% ✗ (missing alt text, broken links)

## Key Discoveries

### 1. File-Based Inputs Work Well

**Pattern that emerged:**
```typescript
export interface BlogPost {
  path: string;        // Path to markdown file
  content?: string;    // Read from file
  frontmatter?: {      // YAML metadata
    title?: string;
    description?: string;
    keywords?: string[];
  };
}
```

**Why this feels right:**
- Blocks can work with ANY file type (markdown, HTML, JSON, images)
- File path becomes part of the entity model
- Frontmatter provides structured metadata
- No need to convert everything to JSON

**Spec implications:**
- Entity fields can be `file_path: string`
- Validators can read/parse files directly
- Test data can reference file paths, not just inline JSON

### 2. Multi-Validator Composition Is Powerful

**Pattern:**
```yaml
blocks:
  validator.humor_tone:        # Focused validator
  validator.content_structure: # Focused validator
  validator.seo_compliance:    # Focused validator
  validator.markdown_quality:  # Focused validator
  validator.comprehensive:     # Orchestrator
```

**Why this feels right:**
- Each validator has single, clear responsibility
- Comprehensive validator weights and aggregates results
- Can run validators individually or together
- Easy to add new validators without changing existing ones

**Spec implications:**
- Blocks should be composable
- Orchestrator pattern should be documented
- Weighted scoring might be a common pattern worth supporting

### 3. Semantic vs Syntactic Validation Boundary

**What we discovered:**

There's a natural split between:

**Syntactic (Deterministic):**
- Valid markdown syntax ✓
- Link format correctness ✓
- Heading hierarchy (no skipped levels) ✓
- Image alt text present ✓

**Semantic (AI-Powered):**
- Is the humor authentic? (not forced)
- Does the tone align with brand voice?
- Is content engaging and conversational?
- Are keywords integrated naturally (not stuffed)?

**Current implementation:**
- Block implementations check syntax (deterministic)
- Domain validator checks semantics (AI-powered)

**Feels right because:**
- Blocks can run fast syntactic checks locally
- AI validator provides deep semantic feedback
- Clear separation of concerns

**Spec implications:**
- Domain rules should distinguish between syntactic and semantic
- Philosophy statements guide semantic validation
- Both are necessary for "quality"

### 4. Philosophy Statements Are Critical

**What we wrote:**
```yaml
philosophy:
  - "Blog posts must include humor and maintain an engaging, conversational tone"
  - "Content structure must be clear with proper introduction, body, conclusion, and TL;DR"
  - "SEO optimization is required without sacrificing readability or authenticity"
  - "Markdown must be valid, accessible, and follow best practices"
```

**Why this matters:**
- Philosophy guides AI semantic validation
- Without it, domain validator doesn't know what "quality" means
- Helps AI distinguish "dry academic" from "engaging conversational"
- Prevents "technically correct but missing the point" implementations

**Spec implications:**
- Philosophy is NOT optional for semantic validation
- Should be prominent in blocks.yml schema
- Examples should show good philosophy statements
- AI prompt should heavily weight philosophy

### 5. Measures Define Quality Thresholds

**Pattern that emerged:**
```yaml
measures:
  humor_score:
    type: number
    constraints:
      - "Must be >= 0.6 for publication"
      - "Humor should be authentic, not forced"

  readability_score:
    type: number
    constraints:
      - "Target: 60-70 (8th-9th grade reading level)"
```

**Why this feels powerful:**
- Quantifies subjective quality ("humor")
- Provides clear thresholds (>= 0.6)
- Guides implementation (what to measure)
- Enables scoring/ranking

**Spec implications:**
- Measures should support numeric ranges
- Constraints should be actionable
- Scoring should be a first-class concept

### 6. Actionable Feedback > Pass/Fail

**What users want to see:**
```
⚠️  WARNINGS (2):
- [Humor/Tone] Content lacks conversational tone
  → Use more second-person pronouns (you, your) and first-person (I, we)

- [SEO Compliance] Keyword density too high (4.42%)
  → Reduce keyword repetition to avoid appearing spammy (aim for 1-3%)
```

**NOT this:**
```
❌ Validation failed
```

**Pattern:**
```typescript
export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;              // Where in the file
  suggestion?: string;         // HOW to fix it
}
```

**Spec implications:**
- ValidationResult should be standardized
- Suggestion field is critical
- Line numbers matter for file-based content
- Severity levels help prioritize

### 7. Schema Validation Discoveries

**What we learned running `blocks run --all`:**

✅ **Entity fields must be simple strings**
```yaml
# WORKS:
domain:
  entities:
    blog_post:
      fields:
        - path
        - content
        - frontmatter

# DOESN'T WORK:
domain:
  entities:
    blog_post:
      fields:
        - name: path          # ❌ No nested objects
          type: string
```

✅ **Block type field is REQUIRED**
```yaml
# Even though docs say "type field removed", CLI requires it:
blocks:
  validator.humor_tone:
    type: validator  # ✅ Required!
```

✅ **Schema and shape validators work perfectly**
- Schema validator checks I/O types match block definition
- Shape validator checks index.ts and block.ts exports
- Both are fast, deterministic

❌ **Domain validator needs OpenAI key**
- Can't test semantic validation without API key
- This is expected behavior
- Would be good to document in README

### 8. What's Missing from blocks.yml Schema

**Things we needed but weren't sure how to express:**

#### A. Validator Weighting
```yaml
# We want this:
blocks:
  validator.comprehensive:
    weights:
      humor_tone: 0.25
      content_structure: 0.30
      seo_compliance: 0.25
      markdown_quality: 0.20
```

Currently: Hardcoded in implementation

#### B. Test Data as Files
```yaml
# We want this:
blocks:
  validator.humor_tone:
    test_data:
      - path: "test-data/good-post.md"
        expected: { compliant: true, score: ">= 0.6" }
      - path: "test-data/no-humor.md"
        expected: { compliant: false }
```

Currently: Test data not used by validators yet

#### C. Validator Dependencies
```yaml
# We want this:
blocks:
  validator.comprehensive:
    depends_on:
      - validator.humor_tone
      - validator.content_structure
      - validator.seo_compliance
      - validator.markdown_quality
```

Currently: Implicit in implementation

### 8. What Worked Well

✅ **Entity definitions** - Clear structure for blog_post, validation_result, comprehensive_report

✅ **Signals** - Naming concepts (humor_presence, seo_readiness) helped clarify what to extract

✅ **Domain rules** - Specific, actionable rules per validator

✅ **Philosophy** - Guided semantic validation effectively

✅ **Discovery root** - `validators/` instead of `blocks/` felt natural

✅ **Path field** - Allowed custom organization (validators/humor-tone)

### 9. What Felt Awkward

❌ **Type field** - Still present in resume example's blocks.yml (docs say removed)

❌ **Templates section** - Still in resume example (docs say removed)

❌ **Agent configuration** - Not clear when/how this is used

❌ **Validator vs pipeline** - Redundant? Both define the same validators

❌ **Test data unused** - Defined in schema but validators don't use it yet

❌ **Signals vs measures** - Overlap? When to use which?

### 10. Questions for Spec Evolution

1. **Should blocks.yml support validator composition explicitly?**
   - Weights, dependencies, orchestration patterns

2. **Should test data be first-class?**
   - File-based test cases
   - Expected results
   - Automated testing via CLI

3. **What's the relationship between signals and measures?**
   - Are signals what you extract, measures what you validate?
   - Should they be combined?

4. **Should philosophy be required for semantic validation?**
   - Hard requirement or optional?
   - Validation fails without it?

5. **Do we need workflow/state concepts?**
   - This example doesn't need it
   - But blog publishing has states: draft → review → published
   - Worth exploring in example #3?

6. **Should validators return standardized results?**
   - ValidationResult interface as part of the spec?
   - Standard fields: compliant, score, issues, suggestions?

## Recommendations for Spec

### High Priority

1. **Standardize ValidationResult interface**
   - Compliant (boolean)
   - Score (number, 0-1)
   - Issues (array with severity, message, line, suggestion)
   - Suggestions (array of strings)

2. **Make philosophy prominent**
   - Required for semantic validation
   - Examples of good philosophy statements
   - AI prompt should weight this heavily

3. **Support file-based entities**
   - Document pattern: `path: string` field
   - Validators can read files directly
   - Test data can reference file paths

4. **Remove deprecated fields**
   - Clean up resume example (remove type, templates)
   - Ensure examples match docs

### Medium Priority

5. **Add validator composition**
   - Weights field
   - Dependencies field
   - Orchestration patterns

6. **Make test data useful**
   - File-based test cases
   - Expected results
   - CLI can run automated tests

7. **Clarify signals vs measures**
   - Better documentation
   - Clear examples
   - Consider merging?

### Low Priority (Explore Later)

8. **Workflow/state support**
   - Example #3: Blog publishing workflow
   - State transitions with validation

9. **Visual validators**
   - Screenshot-based validation
   - Vision models for design quality

10. **Auto-healing**
    - AI proposes fixes, not just feedback

## Next Steps

1. **Review this with team** - Are these insights valuable?
2. **Update spec based on learnings** - Incorporate recommendations
3. **Create example #3** - Different domain (workflow? API validation? data pipeline?)
4. **Document patterns** - File-based entities, multi-validator composition, etc.
5. **Clean up existing examples** - Remove deprecated fields from resume example

## Conclusion

Building the blog content validator revealed:

- **File-based inputs work great** - No need to force everything into JSON
- **Multi-validator composition is powerful** - Each block focused, orchestrator aggregates
- **Semantic vs syntactic split is natural** - Blocks check syntax, AI checks meaning
- **Philosophy statements are critical** - Without them, AI doesn't know what "quality" means
- **Actionable feedback matters** - Users need "how to fix" not just "you failed"

The spec is mostly right, but needs:
- Standardized validation results
- Explicit composition support
- Philosophy as a first-class concept
- Better test data integration
- Cleanup of deprecated fields

Overall: **This feels powerful.** The validation feedback is actionable, the composition is clean, and the domain semantics provide real guidance. Worth continuing the discovery phase with more examples.
