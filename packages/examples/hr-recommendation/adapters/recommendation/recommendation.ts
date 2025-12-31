import { AIProvider } from "@blocksai/ai";
import {
  RecommendationSchema,
  type Resume,
  type JobDescription,
  type Recommendation,
  type ScoreResult
} from "../../types/index.js";
import { scoreSkills } from "../skills/index.js";
import { scoreExperience } from "../experience/index.js";
import { scoreEducation } from "../education/index.js";

const ai = new AIProvider({ provider: "openai", model: "gpt-4.1-mini" });

const SYSTEM_PROMPT = `You are a senior HR director making final hiring recommendations for the American job market.
Synthesize individual assessment scores into a holistic hiring decision.
Consider US employment law, EEOC compliance requirements, at-will employment context, and American hiring practices.
Handle cases with incomplete assessment data gracefully by weighing available scores appropriately.
Be decisive but fair, providing clear reasoning for your recommendation.`;

const buildPrompt = (
  resume: Resume,
  job: JobDescription,
  skills: ScoreResult,
  experience: ScoreResult,
  education: ScoreResult
): string => {
  return `
Make a final hiring recommendation based on the individual assessments.

## Position
**Title:** ${job.title}
**Department:** ${job.department || "Not specified"}

## Candidate
**Name:** ${resume.basics?.name || "Unknown"}
**Current Role:** ${resume.basics?.label || "Not specified"}

## Assessment Scores

### Skills Assessment (Score: ${skills.score.toFixed(2)})
**Reasoning:** ${skills.reasoning}
**Matches:** ${skills.matched_items.join(", ") || "None"}
**Gaps:** ${skills.gaps.join(", ") || "None"}

### Experience Assessment (Score: ${experience.score.toFixed(2)})
**Reasoning:** ${experience.reasoning}
**Matches:** ${experience.matched_items.join(", ") || "None"}
**Gaps:** ${experience.gaps.join(", ") || "None"}

### Education Assessment (Score: ${education.score.toFixed(2)})
**Reasoning:** ${education.reasoning}
**Matches:** ${education.matched_items.join(", ") || "None"}
**Gaps:** ${education.gaps.join(", ") || "None"}

## Decision Criteria
- Weighted overall score: Skills (40%) + Experience (40%) + Education (20%)
- Hire decisions: strong_yes (>0.85), yes (0.70-0.85), maybe (0.55-0.70), no (0.40-0.55), strong_no (<0.40)
- Identify 2-4 key strengths and 1-3 key concerns

## Important Guidelines
- If any assessment has incomplete data, note it but make a fair decision based on available information
- Ensure recommendation reasoning is objective and EEOC compliant
- Focus on job-relevant qualifications only
- Work authorization is a separate consideration and should not bias the skills/experience/education assessment

Provide your final recommendation with clear reasoning.
`;
};

export async function getRecommendation(
  resume: Resume,
  job: JobDescription
): Promise<Recommendation> {
  // Run all adapters in parallel for efficiency
  const [skills, experience, education] = await Promise.all([
    scoreSkills(resume, job),
    scoreExperience(resume, job),
    scoreEducation(resume, job)
  ]);

  return ai.generateStructured({
    schema: RecommendationSchema,
    prompt: buildPrompt(resume, job, skills, experience, education),
    system: SYSTEM_PROMPT
  });
}
