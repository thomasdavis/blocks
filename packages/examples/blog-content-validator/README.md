# Blog Content Validator

> Multi-validator system for ensuring blog post quality through humor, structure, SEO, and markdown compliance checks.

This is a **discovery phase example** for the Blocks framework, exploring how domain-driven validation works with file-based content (markdown blog posts).

## Overview

This example demonstrates:

- **File-based inputs**: Validators work with markdown files, not just JSON objects
- **Multi-validator composition**: 5 blocks working together to validate different aspects
- **Content quality as semantic constraints**: Humor, tone, readability—not just syntax
- **Domain-driven validation**: Philosophy statements guide AI semantic validation

## Architecture

### 5 Validation Blocks

1. **`validator.humor_tone`** - Validates humor presence and brand voice alignment
2. **`validator.content_structure`** - Validates structure (intro, body, conclusion, TL;DR, heading hierarchy)
3. **`validator.seo_compliance`** - Validates SEO (meta description, keywords, readability)
4. **`validator.markdown_quality`** - Validates markdown syntax, links, images, code blocks
5. **`validator.comprehensive`** - Orchestrates all validators, produces comprehensive report

### Domain Semantics

Defined in `blocks.yml`:

- **Entities**: `blog_post`, `validation_result`, `comprehensive_report`
- **Signals**: `humor_presence`, `brand_voice_alignment`, `content_structure_quality`, `seo_readiness`, `markdown_validity`
- **Measures**: `humor_score`, `tone_consistency`, `structure_completeness`, `seo_score`, `readability_score`, `markdown_validity`
- **Philosophy**: Guides AI validation with statements like "Blog posts must include humor and maintain an engaging, conversational tone"

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build TypeScript

```bash
npm run build
```

### 3. Run Validators

```bash
# Run comprehensive validator (all checks)
npm run validate

# Or run individual validators
npm run validate:humor
npm run validate:structure
npm run validate:seo
npm run validate:markdown

# Or validate all blocks
npm run validate:all
```

## Test Data

Three markdown files demonstrate different validation scenarios:

### `test-data/good-post.md`

A well-crafted blog post that passes all validations:
- ✅ Conversational tone with humor
- ✅ Clear structure (intro, body, conclusion, TL;DR)
- ✅ Proper meta description and keywords
- ✅ Valid markdown with alt text and language-specified code blocks

### `test-data/no-humor.md`

A dry, academic post that fails humor/tone validation:
- ❌ Overly formal, corporate language
- ❌ No personality or storytelling
- ✅ Good structure and SEO
- ✅ Valid markdown

### `test-data/poor-seo.md`

A casual post with SEO and markdown issues:
- ✅ Conversational tone
- ❌ Missing meta description
- ❌ No keywords
- ❌ Images without alt text
- ❌ Code blocks without language
- ❌ Broken links

## How It Works

### 1. Read `blocks.yml`

The domain specification defines what makes a "good" blog post:

```yaml
philosophy:
  - "Blog posts must include humor and maintain an engaging, conversational tone"
  - "Content structure must be clear with proper introduction, body, conclusion, and TL;DR"
  - "SEO optimization is required without sacrificing readability or authenticity"
  - "Markdown must be valid, accessible, and follow best practices"
```

### 2. Implement Validators

Each validator is a simple TypeScript function (~100-200 lines):

```typescript
export function validateHumorTone(post: BlogPost): ValidationResult {
  const content = readFileSync(post.path, 'utf-8');

  // Simple heuristics for humor detection
  // (Real implementation would use AI/NLP)

  return {
    compliant: score >= 0.6,
    score,
    issues,
    suggestions,
  };
}
```

### 3. Run Blocks CLI

```bash
blocks run validator.comprehensive
```

The Blocks CLI:
1. Reads `blocks.yml` to understand domain
2. Discovers validators in `validators/` directory
3. Runs schema, shape, and domain validators
4. Provides actionable feedback

### 4. Interpret Validator Output

```
📦 Validating: validator.comprehensive

  ✓ schema ok
  ✓ shape ok

  ⚠ [domain] Comprehensive validator should aggregate all sub-validator results
  → Suggestion: Ensure all 4 validators are called and results properly aggregated

  ❌ Block "validator.comprehensive" has warnings
```

### 5. Fix Issues & Re-run

Make changes based on validator feedback, then re-run until all checks pass.

## Domain Rules

Each validator enforces specific domain rules:

### Humor/Tone Rules
- Humor must feel natural and authentic (not forced)
- Tone must align with conversational, approachable brand voice
- Content must engage reader through personality and storytelling

### Content Structure Rules
- Introduction must hook reader and provide context
- Body must be organized into logical sections with clear headings
- Conclusion must summarize key points or provide actionable takeaways
- TL;DR must be present and accurately summarize main points
- Heading hierarchy must be logical (no skipped levels)

### SEO Compliance Rules
- Meta description must be compelling, accurate, and 120-160 chars
- Keywords must be integrated naturally (not forced or repetitive)
- Content must be readable (grade 8-9 level) while remaining informative
- Should include relevant internal links to related content

### Markdown Quality Rules
- All links must be properly formatted and not broken
- All images must have descriptive alt text for accessibility
- Code blocks must specify language for syntax highlighting
- Lists, emphasis, and formatting must be consistent throughout

## Key Patterns

### File-Based Inputs

Unlike the resume themes example (JSON objects), this example works with markdown files:

```typescript
export interface BlogPost {
  path: string;              // Path to .md file
  content?: string;          // Raw markdown (read from file)
  frontmatter?: {            // YAML frontmatter
    title?: string;
    description?: string;
    keywords?: string[];
  };
}
```

### Multi-Validator Composition

The comprehensive validator orchestrates others:

```typescript
export function validateComprehensive(post: BlogPost): ComprehensiveReport {
  // Run all validators
  const humorResult = validateHumorTone(post);
  const structureResult = validateContentStructure(post);
  const seoResult = validateSEOCompliance(post);
  const markdownResult = validateMarkdownQuality(post);

  // Aggregate results
  return {
    overall_compliant: allPassed,
    overall_score: weightedAverage,
    validator_results: { /* all results */ },
    summary: generateSummary(),
  };
}
```

### Semantic vs Syntactic Validation

This example explores the boundary between:

- **Syntactic validation** (deterministic): Valid markdown syntax, link format, heading hierarchy
- **Semantic validation** (AI-powered): Humor presence, tone alignment, content quality

The domain validator (AI-powered) checks semantic alignment, while the block implementations check syntax.

## Discovery Insights

This example helps answer:

1. **How do blocks work with file-based inputs?**
   - Blocks can read markdown files directly
   - Frontmatter provides structured metadata
   - File path becomes part of the entity

2. **How do multiple validators compose?**
   - Each validator has clear, focused responsibility
   - Comprehensive validator orchestrates and aggregates
   - Results can be weighted and prioritized

3. **What are domain semantics for content quality?**
   - Philosophy statements guide AI validation
   - Measures define quality thresholds (humor score >= 0.6)
   - Domain rules provide specific, actionable constraints

4. **Does the spec need workflow/state concepts?**
   - This example doesn't need workflow states
   - But could be extended: draft → review → approved → published
   - Worth exploring in future examples

## Next Steps

After running validators on test data:

1. Observe what feels right/wrong about the validation feedback
2. Document insights for spec evolution
3. Consider: Does `blocks.yml` schema feel natural for this use case?
4. Explore: What would workflow validation look like? (draft → published)
5. Try: Building your own blog validator with different domain rules

## Related Examples

- **`examples/json-resume-themes/`** - Template rendering with semantic HTML validation

## License

MIT
