import { AIProvider } from "@blocksai/ai";
import { ScoreResultSchema, type Resume, type JobDescription, type ScoreResult } from "../../types/index.js";

const ai = new AIProvider({ provider: "openai", model: "gpt-4.1-mini" });

const SYSTEM_PROMPT = `You are an expert HR analyst specializing in technical skill assessment for the American job market.
Evaluate candidates objectively based on skill alignment with job requirements.
Consider US industry standards, American technology adoption patterns, and EEOC compliance.
Handle missing or incomplete skill data gracefully by noting gaps without penalizing unfairly.
Always provide specific reasoning with concrete examples from the resume.`;

const buildPrompt = (resume: Resume, job: JobDescription): string => {
  const candidateSkills = resume.skills?.map(s =>
    `- ${s.name}: ${s.keywords?.join(", ") || "No keywords"}`
  ).join("\n") || "No skills listed";

  return `
Evaluate the candidate's skills against the job requirements.

## Job Requirements
**Required Skills:** ${job.required_skills.join(", ")}
**Preferred Skills:** ${job.preferred_skills?.join(", ") || "None specified"}

## Candidate Skills
${candidateSkills}

## Scoring Criteria (weights sum to 100%)
- Required skills match: 70% of score (candidate should have most required skills)
- Preferred skills match: 20% of score (bonus for having preferred skills)
- Skill depth/keywords: 10% of score (having related technologies)

## Important Guidelines
- If skills data is missing or incomplete, note it as a gap but score fairly based on available data
- Consider US industry certifications (AWS, Azure, PMP, etc.) as skill validators
- Evaluate transferable skills that may satisfy requirements indirectly

Provide a score between 0.0 and 1.0. List specific matched skills and identify gaps.
Be objective and reference specific skills from both the job requirements and resume.
`;
};

export async function scoreSkills(resume: Resume, job: JobDescription): Promise<ScoreResult> {
  return ai.generateStructured({
    schema: ScoreResultSchema,
    prompt: buildPrompt(resume, job),
    system: SYSTEM_PROMPT
  });
}
