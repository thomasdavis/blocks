import { AIProvider } from "@blocksai/ai";
import { ScoreResultSchema, type Resume, type JobDescription, type ScoreResult } from "../../types/index.js";

const ai = new AIProvider({ provider: "openai", model: "gpt-4.1-mini" });

const SYSTEM_PROMPT = `You are an expert HR analyst specializing in work experience evaluation for the American job market.
Assess candidates based on relevance, depth, and progression of their work history.
Consider US workplace culture, American company recognition, at-will employment context, and industry norms.
Be mindful of EEOC compliance - evaluate experience objectively without bias.
Handle missing or incomplete work history gracefully by assessing available data fairly.
Always provide specific reasoning with concrete examples from their experience.`;

const buildPrompt = (resume: Resume, job: JobDescription): string => {
  const workHistory = resume.work?.map(w =>
    `- **${w.position}** at ${w.name} (${w.startDate} - ${w.endDate || "present"})
  ${w.summary || ""}
  Highlights: ${w.highlights?.join("; ") || "None listed"}`
  ).join("\n\n") || "No work experience listed";

  const expReqs = job.experience_requirements;

  return `
Evaluate the candidate's work experience against the job requirements.

## Job Experience Requirements
**Minimum Years:** ${expReqs?.minimum_years || "Not specified"}
**Preferred Years:** ${expReqs?.preferred_years || "Not specified"}
**Required Experience:**
${expReqs?.required_experience?.map(e => `- ${e}`).join("\n") || "None specified"}

## Candidate Work History
${workHistory}

## Scoring Criteria (weights sum to 100%)
- Years of experience: 30% (meets minimum/preferred years)
- Role relevance: 40% (similar responsibilities, technical scope)
- Career progression: 20% (growth in seniority and scope)
- Industry alignment: 10% (relevant industry experience)

## Important Guidelines
- If work history is incomplete, assess based on available data without unfair penalties
- Consider US market equivalencies for international experience
- Recognize diverse career paths - non-linear progression can still demonstrate growth
- Work authorization status should not factor into experience scoring (EEOC compliance)

Provide a score between 0.0 and 1.0. Identify what experience matches and what's missing.
Reference specific roles and achievements from the resume.
`;
};

export async function scoreExperience(resume: Resume, job: JobDescription): Promise<ScoreResult> {
  return ai.generateStructured({
    schema: ScoreResultSchema,
    prompt: buildPrompt(resume, job),
    system: SYSTEM_PROMPT
  });
}
