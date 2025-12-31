# JSON Resume Themes Example

This example demonstrates how to use **Blocks** to validate JSON Resume themes with domain-driven semantics.

## Overview

This project shows how Blocks can be used to:
- Define domain semantics for resume themes
- Validate theme implementations against requirements
- Ensure consistency across multiple themes
- Express design principles as executable constraints

## Project Structure

```
json-resume-themes/
├── blocks.yml              # Domain specification (with custom paths!)
├── themes/                 # Theme source code (can be any structure you want)
│   └── modern-professional/
│       ├── index.ts
│       ├── block.ts
│       └── template.hbs
├── test-data/
│   └── sample-resume.json  # Test resume data
├── output.html             # Rendered output
└── package.json
```

**Note:** Blocks respects your project structure! The `path` field in each block definition tells Blocks where to find your code. You're not forced into a `blocks/` folder structure.

## Domain Model

### Entities

- **resume** - JSON Resume schema (basics, work, education, skills, etc.)
- **theme_config** - Customization options (colors, fonts, layout)

### Signals

- **readability** - Typography, spacing, visual hierarchy
- **professional_tone** - Design formality and color choices
- **information_density** - Content vs whitespace balance
- **accessibility** - WCAG compliance, semantic HTML

### Measures

- **valid_html** - Must output valid HTML5
- **responsive_layout** - Must work on mobile/tablet/desktop
- **accessibility_score** - Semantic HTML + ARIA + contrast

### Domain Rules

The `modern_professional` theme must:
1. Use semantic HTML5 tags (header, main, section, article)
2. Include proper ARIA labels and semantic structure
3. Implement responsive design with CSS media queries
4. Establish clear visual hierarchy with typography

## Installation

```bash
npm install
```

## Usage

### Build the Theme

```bash
npm run build
```

### Render a Resume

```bash
npm run render
```

This generates `output.html` from the sample resume data.

### Validate the Theme

```bash
npm run validate
```

Or from the root of the Blocks repository:

```bash
blocks run theme.modern_professional
```

## Validation Output

When you run `blocks run theme.modern_professional`, you'll see:

```
🧱 Blocks Validator

📦 Validating: theme.modern_professional
  ✓ schema ok
  ✓ shape ok
  ⚠ [domain] AI validation failed: OpenAI API key is missing

  ⚠️  Block "theme.modern_professional" has warnings
```

### What Gets Validated

1. **Schema Validation** ✓
   - Checks that inputs match `entity.resume` and `entity.theme_config`
   - Checks that output is `string` with correct measures
   - Verifies all sections are defined

2. **Shape Validation** ✓
   - Checks for required files (index.ts, block.ts)
   - Validates export structure
   - Ensures file naming conventions

3. **Domain Validation** (requires API key)
   - AI analyzes if code follows domain rules
   - Checks for semantic HTML usage
   - Validates accessibility features
   - Verifies responsive design implementation
   - Detects undocumented concepts (drift)

### Running with AI Validation

To enable full domain validation, you need to configure your OpenAI API key.

#### Option 1: Environment Variable

```bash
export OPENAI_API_KEY="sk-your-key-here"
blocks run theme.modern_professional
```

#### Option 2: .env File (Recommended for Development)

Create a `.env` file in this directory:

```bash
cp ../../.env.example .env
```

Edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-key-here
```

Then run validation normally:

```bash
npm run validate
```

#### Getting an API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and save it in your `.env` file

#### What the AI Validator Checks

The AI validator will analyze:
- Whether semantic HTML tags are used properly
- If ARIA labels are included
- Whether the design conveys professionalism
- If responsive design is implemented
- Overall alignment with domain philosophy

Example output with AI validation enabled:

```
📦 Validating: theme.modern_professional
  ✓ schema ok
  ✓ shape ok
  ✗ [domain] The implementation does not specifically ensure the use of semantic HTML tags...
  ✗ [domain] There is no validation or check implemented to ensure that ARIA labels...
  ⚠ [domain] The method signature could benefit from more explicit documentation...
```

The validator provides specific, actionable feedback on how to improve your implementation.

## Theme Implementation

The `modern_professional` theme demonstrates best practices:

### TypeScript Implementation (block.ts)

```typescript
export function modernProfessionalTheme(
  resume: Resume,
  config?: ThemeConfig
): { html: string }
```

- Validates required resume sections
- Compiles Handlebars template
- Returns semantic HTML5

### Handlebars Template (template.hbs)

- Uses semantic HTML5 elements
- Implements responsive CSS with media queries
- Includes ARIA labels for accessibility
- Establishes clear visual hierarchy
- Print-friendly styles

## Philosophy

From `blocks.yml`:

```yaml
philosophy:
  - "Resume themes must prioritize readability and professionalism."
  - "All themes must be responsive and accessible."
  - "Semantic HTML and proper structure are required."
  - "Themes should express the candidate's story clearly."
```

These principles guide both implementation and validation.

## Adding New Themes

1. Create theme in `themes/my-theme/`
2. Add block definition to `blocks.yml`
3. Copy to `blocks/theme.my_theme/` for validation
4. Run `blocks run theme.my_theme`
5. Fix any validation issues
6. Iterate until all validators pass

## What This Example Demonstrates

### For Theme Developers

- Clear requirements via domain specification
- Automated validation of design principles
- Consistency across multiple themes
- Self-documenting architecture

### For Blocks Users

- Real-world domain modeling (resumes/themes)
- Multi-layer validation in action
- How to structure a Blocks project
- Integration with existing tooling (TypeScript, Handlebars)

### For AI Agents

- How to read `blocks.yml` before coding
- How to interpret validator feedback
- How to align code with domain semantics
- Iterative development loop with validation

## Sample Resume

The example includes a sample resume for Sarah Chen, a Senior Software Engineer. This demonstrates:

- All required sections (basics, work, education, skills)
- Optional sections (languages, interests)
- Realistic work history with highlights
- Proper JSON Resume schema compliance

## Next Steps

1. Try modifying the theme design
2. Add a new theme variant
3. Run validation to see domain feedback
4. Experiment with breaking domain rules
5. Add custom domain rules to `blocks.yml`

## Resources

- [JSON Resume Schema](https://jsonresume.org/schema/)
- [Blocks Documentation](../../README.md)
- [Domain Modeling Guide](../../docs/domain-modeling.md)
- [Validator Types](../../docs/validators.md)

---

**This example shows how Blocks brings design systems, domain semantics, and validation to resume themes - but the same principles apply to any domain!**
