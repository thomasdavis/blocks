# HR Recommendation Engine - Development Guide

This document guides Claude (and developers) on how to build consistent, production-ready scoring adapters for the HR recommendation engine using the Blocks framework.

## Overview

This example demonstrates AI-powered scoring adapters that evaluate job candidates against job descriptions. The system uses:

- **Blocks framework** for domain-driven validation
- **AI SDK** with gpt-4.1-mini for intelligent scoring
- **Zod schemas** for type-safe structured output

## Key Principle: blocks.yml is the ONLY Convention

The Blocks framework is intentionally agnostic about file naming and structure. The **only required convention** is the `blocks.yml` configuration file. This means:

- Use any file naming convention that fits your codebase
- Organize adapters however makes sense for your project
- The domain validator reads ALL files in the block folder

## Architecture

### Adapter Pattern

Each adapter is a **block** that:
1. Takes a `Resume` and `JobDescription` as input
2. Uses AI (gpt-4.1-mini) to evaluate fit on a specific dimension
3. Returns a structured `ScoreResult` with score, reasoning, and details

### Folder Structure

```
adapters/
├── skills/
│   ├── skills.ts      # Main implementation
│   └── index.ts       # Exports
├── experience/
│   ├── experience.ts
│   └── index.ts
├── education/
│   ├── education.ts
│   └── index.ts
└── recommendation/    # Orchestrator
    ├── recommendation.ts
    └── index.ts
```

### Data Flow

```
Resume + JobDescription
         │
         ├──► Skills Adapter ──────► ScoreResult
         │
         ├──► Experience Adapter ──► ScoreResult
         │
         ├──► Education Adapter ───► ScoreResult
         │
         └──► Recommendation Orchestrator
                     │
                     ▼
              Recommendation (final decision)
```

## Creating a New Adapter

### Step 1: Define the Block in blocks.yml

```yaml
blocks:
  adapter.your_dimension:
    description: "Scores candidate on [dimension]"
    path: "adapters/your-dimension"
    inputs:
      - { name: resume, type: entity.resume }
      - { name: job, type: entity.job_description }
    outputs:
      - { name: result, type: entity.score_result, measures: [score_0_1] }
```

### Step 2: Create the Adapter Implementation

```typescript
// adapters/your-dimension/your-dimension.ts
import { AIProvider } from "@blocksai/ai";
import { ScoreResultSchema, type Resume, type JobDescription, type ScoreResult } from "../../types/index.js";

const ai = new AIProvider({ provider: "openai", model: "gpt-4.1-mini" });

const SYSTEM_PROMPT = `You are an expert HR analyst specializing in [dimension].
Evaluate candidates objectively based on [criteria].
Always provide specific reasoning with concrete examples.`;

const buildPrompt = (resume: Resume, job: JobDescription): string => {
  // Extract relevant data from resume and job
  // Format into clear, structured prompt
  return `...`;
};

export async function scoreDimension(
  resume: Resume,
  job: JobDescription
): Promise<ScoreResult> {
  return ai.generateStructured({
    schema: ScoreResultSchema,
    prompt: buildPrompt(resume, job),
    system: SYSTEM_PROMPT
  });
}
```

### Step 3: Export from index.ts

```typescript
export { scoreDimension } from "./your-dimension.js";
export type { Resume, JobDescription, ScoreResult } from "../../types/index.js";
```

## Prompt Engineering Best Practices

### 1. Be Specific About Scoring Criteria

```typescript
const buildPrompt = (resume: Resume, job: JobDescription) => `
## Scoring Criteria
- Factor A: 0-40% (description of weight)
- Factor B: 0-35% (description of weight)
- Factor C: 0-25% (description of weight)
`;
```

### 2. Reference Exact Field Names

```typescript
// Good: Reference specific data
const skills = resume.skills?.map(s => s.name).join(", ");

// Bad: Vague references
const skills = "the candidate's skills";
```

### 3. Handle Missing Data Gracefully

```typescript
const experience = resume.work?.map(w => w.position).join(", ") || "No work experience listed";
```

### 4. Request Specific Output Format

```typescript
const prompt = `
Provide a score between 0.0 and 1.0.
List specific matched items from the resume.
Identify gaps where requirements are not met.
`;
```

## Domain Rules (Enforced by Blocks Validator)

All adapters must follow these rules defined in `blocks.yml`:

| Rule | Description |
|------|-------------|
| `objective_scoring` | Scores must be based on objective criteria from inputs, not assumptions |
| `transparent_reasoning` | Must provide clear reasoning that references specific data points |
| `graceful_degradation` | Must handle missing or incomplete data without failing |
| `consistent_output` | Must always return the expected structured output type |

The domain validator uses AI to check your adapter code against these rules at development time.

## Type Definitions

### Resume (JSON Resume format)

```typescript
interface Resume {
  basics?: { name, label, email, summary, location, profiles }
  work?: Array<{ name, position, startDate, endDate, highlights }>
  education?: Array<{ institution, area, studyType, startDate, endDate }>
  skills?: Array<{ name, keywords }>
  certifications?: Array<{ name, issuer, date }>
  projects?: Array<{ name, description, highlights }>
}
```

### JobDescription

```typescript
interface JobDescription {
  title: string
  required_skills: string[]
  preferred_skills?: string[]
  experience_requirements?: { minimum_years, preferred_years, required_experience }
  education_requirements?: { minimum_degree, preferred_degree, preferred_fields }
  responsibilities?: string[]
}
```

### ScoreResult

```typescript
interface ScoreResult {
  score: number          // 0.0 to 1.0
  reasoning: string      // Explanation of score
  matched_items: string[] // What matched
  gaps: string[]         // What's missing
  confidence: number     // 0.0 to 1.0
}
```

## Testing Your Adapter

### Validate Single Adapter

```bash
pnpm validate:skills
pnpm validate:experience
pnpm validate:education
pnpm validate:recommendation
```

### Validate All Adapters

```bash
pnpm validate
```

### What the Validator Checks

1. **Schema validation** - Inputs/outputs match blocks.yml
2. **Shape validation** - TypeScript files exist with exports
3. **Domain validation** - AI checks code against domain rules

## Running the Example

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm build

# Validate all adapters
pnpm validate
```

## Example: Adding a Culture Fit Adapter

```yaml
# blocks.yml
blocks:
  adapter.culture:
    description: "Scores candidate culture fit based on values and work style"
    path: "adapters/culture"
    inputs:
      - { name: resume, type: entity.resume }
      - { name: job, type: entity.job_description }
    outputs:
      - { name: result, type: entity.score_result, measures: [score_0_1] }
```

```typescript
// adapters/culture/culture.ts
import { AIProvider } from "@blocksai/ai";
import { ScoreResultSchema, type Resume, type JobDescription, type ScoreResult } from "../../types/index.js";

const ai = new AIProvider({ provider: "openai", model: "gpt-4.1-mini" });

const SYSTEM_PROMPT = `You are an expert in organizational culture and team dynamics.
Infer culture fit signals from the candidate's experience, projects, and career choices.`;

const buildPrompt = (resume: Resume, job: JobDescription): string => {
  // Extract culture signals from resume
  const highlights = resume.work?.flatMap(w => w.highlights || []).join("\n") || "";

  return `
Evaluate culture fit signals from the candidate's resume.

## Job Responsibilities
${job.responsibilities?.join("\n") || "Not specified"}

## Candidate Experience Highlights
${highlights || "No highlights listed"}

## Culture Signals to Look For
- Collaboration indicators (team projects, cross-functional work)
- Growth mindset (learning, taking on challenges)
- Leadership style (mentoring, initiative)
- Values alignment (company mission, work style)

Score 0.0-1.0 based on inferred culture fit.
`;
};

export async function scoreCulture(resume: Resume, job: JobDescription): Promise<ScoreResult> {
  return ai.generateStructured({
    schema: ScoreResultSchema,
    prompt: buildPrompt(resume, job),
    system: SYSTEM_PROMPT
  });
}
```

## Best Practices Summary

1. **Keep adapters focused** - One dimension per adapter
2. **Use parallel execution** - Run independent adapters concurrently
3. **Handle missing data** - Never fail on incomplete input
4. **Be specific in prompts** - Reference exact field names
5. **Define clear scoring criteria** - Weighted breakdown helps consistency
6. **Test with varied data** - Edge cases reveal prompt weaknesses
7. **Document your reasoning** - Future maintainers will thank you

## Philosophy

This example embodies the Blocks philosophy:

- **Development-time validation** - Catch issues before runtime
- **Domain-driven design** - Define semantics in blocks.yml
- **AI-powered guidance** - Use AI to validate code intent
- **Production-ready patterns** - Real-world adapter architecture
