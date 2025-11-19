# Getting Started with Blocks

## Installation

### For Users

Install the CLI globally or as a dev dependency:

```bash
# Global installation (coming soon to npm)
npm install -g @blocks/cli

# Or as a dev dependency
pnpm add -D @blocks/cli
```

### For Development

Clone and build the repository:

```bash
git clone <your-repo-url>
cd blocks
pnpm install
pnpm build
```

## Quick Start

### 1. Initialize a Project

Create a new `blocks.yml` configuration:

```bash
blocks init
```

This creates a template configuration with:
- Project metadata
- Philosophy statements
- Domain entities, signals, and measures
- Example block definitions
- Validator pipeline configuration

### 2. Define Your Domain

Edit `blocks.yml` to match your project's domain:

```yaml
domain:
  entities:
    candidate:
      fields: [skills, experience, industry, values]

    job:
      fields: [skills_required, culture, seniority]

  signals:
    culture_fit:
      description: "Behavioral & values alignment"
      extraction_hint: "Compare candidate values with job culture"

  measures:
    score_0_1:
      constraints:
        - "Value must be between 0 and 1"
```

### 3. Define Blocks

Add block definitions to `blocks.yml`:

```yaml
blocks:
  facet.culture_fit:
    type: facet
    description: "Calculate culture fit score"
    inputs:
      - name: candidate
        type: entity.candidate
      - name: job
        type: entity.job
    outputs:
      - name: score
        type: measure.score_0_1
    domain_rules:
      - id: must_reference_values
        description: "Must reference candidate values or job culture"
```

### 4. Implement the Block

Create the block directory and files:

```bash
mkdir -p blocks/facet.culture_fit
```

`blocks/facet.culture_fit/block.ts`:

```typescript
interface Candidate {
  values: string[];
  behaviors: string[];
}

interface Job {
  culture: string[];
  required_traits: string[];
}

export async function cultureFit(candidate: Candidate, job: Job) {
  // Calculate alignment between candidate values and job culture
  const valueOverlap = candidate.values.filter(v =>
    job.culture.includes(v)
  ).length;

  const score = valueOverlap / Math.max(candidate.values.length, job.culture.length);

  return { score };
}
```

`blocks/facet.culture_fit/index.ts`:

```typescript
export { cultureFit } from "./block.js";
```

### 5. Run Validation

Validate your block:

```bash
blocks run facet.culture_fit
```

Output:

```
🧱 Blocks Validator

📦 Validating: facet.culture_fit
  ✓ schema ok
  ✓ shape ok
  Running domain validation...
  ✓ domain ok

  ✅ Block "facet.culture_fit" passed all validations
```

### 6. Fix Issues (if any)

If validation fails:

```
📦 Validating: facet.culture_fit
  ✓ schema ok
  ✓ shape ok

  ⚠ [domain] Score calculation doesn't reference job.culture
  → Suggestion: Use job.culture in score calculation

  ❌ Block "facet.culture_fit" has warnings
```

Update your code based on the feedback and re-run.

## Development Workflow

### With AI Coding Tools (Claude Code, Cursor, etc.)

1. **Agent reads `blocks.yml`**
   - Understands domain concepts
   - Knows block requirements

2. **Agent implements block**
   - Writes code according to spec
   - Follows domain rules

3. **Agent runs `blocks run <name>`**
   - Gets immediate feedback
   - Sees what needs fixing

4. **Agent fixes issues**
   - Iterates based on validator output
   - Re-runs until passing

5. **Agent proposes spec updates** (if needed)
   - Detects new concepts
   - Asks user to approve changes

### Manual Workflow

1. Read `blocks.yml`
2. Implement block
3. Run `blocks run <name>`
4. Fix issues
5. Repeat until passing

## Environment Setup

### AI Provider

Blocks uses OpenAI for semantic validation. Set your API key:

```bash
export OPENAI_API_KEY="sk-..."
```

Or create a `.env` file:

```env
OPENAI_API_KEY=sk-...
```

## Project Structure

```
your-project/
├── blocks.yml              # Domain & block definitions
├── blocks/                 # Block implementations
│   ├── block_name/
│   │   ├── block.ts       # Main logic
│   │   └── index.ts       # Exports
│   └── ...
└── package.json
```

## Next Steps

- [Domain Modeling Guide](./domain-modeling.md)
- [Validator Documentation](./validators.md)
- [Architecture Overview](./architecture.md)
- [Claude Code Integration](../claude.md)

## Common Issues

### "Config file not found: blocks.yml"

Run `blocks init` to create the configuration file.

### "AI validation failed"

Check that `OPENAI_API_KEY` is set and valid.

### "Block not found in config"

Ensure the block is defined in `blocks.yml` under the `blocks:` section.

### "Required file not found"

Blocks expect `index.ts` and `block.ts` in each block directory.

## Getting Help

- Check the [documentation](./architecture.md)
- Read the [claude.md](../claude.md) for AI integration
- Open an issue on GitHub
