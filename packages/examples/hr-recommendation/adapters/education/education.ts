import { AIProvider } from "@blocksai/ai";
import { ScoreResultSchema, type Resume, type JobDescription, type ScoreResult } from "../../types/index.js";

const ai = new AIProvider({ provider: "openai", model: "gpt-4.1-mini" });

const SYSTEM_PROMPT = `You are an expert HR analyst specializing in educational background evaluation for the American job market.
Assess candidates based on degree level, field of study, and institution accreditation.
Use US degree equivalencies: Associate's, Bachelor's, Master's, Doctorate (PhD/JD/MD).
Recognize regionally accredited US institutions and evaluate international credentials using US equivalency standards.
Handle missing education data gracefully - some roles value experience over formal education.
Be mindful of EEOC compliance - evaluate credentials objectively without bias.
Always provide specific reasoning referencing their educational credentials.`;

const buildPrompt = (resume: Resume, job: JobDescription): string => {
  const education = resume.education?.map(e =>
    `- **${e.studyType || "Degree"}** in ${e.area || "Unknown field"} from ${e.institution}
  (${e.startDate || "?"} - ${e.endDate || "?"})${e.score ? ` - ${e.score}` : ""}`
  ).join("\n") || "No education listed";

  const certifications = resume.certifications?.map(c =>
    `- ${c.name} (${c.issuer || "Unknown issuer"}, ${c.date || "Unknown date"})`
  ).join("\n") || "None";

  const eduReqs = job.education_requirements;

  return `
Evaluate the candidate's education against the job requirements.

## Job Education Requirements
**Minimum Degree:** ${eduReqs?.minimum_degree || "Not specified"}
**Preferred Degree:** ${eduReqs?.preferred_degree || "Not specified"}
**Preferred Fields:** ${eduReqs?.preferred_fields?.join(", ") || "Not specified"}

## Candidate Education
${education}

## Certifications
${certifications}

## Scoring Criteria (weights sum to 100%)
- Degree level: 40% (meets minimum/preferred degree requirements)
- Field relevance: 35% (field of study aligns with job requirements)
- Institution accreditation: 15% (regionally accredited US institution or recognized international equivalent)
- Certifications: 10% (relevant professional certifications as supplementary credit)

## US Degree Equivalencies
- High School Diploma / GED
- Associate's Degree (2-year)
- Bachelor's Degree (4-year)
- Master's Degree (graduate)
- Doctorate (PhD, JD, MD, EdD)

## Important Guidelines
- If education data is missing, note it but don't over-penalize - many US roles accept equivalent experience
- International degrees should be evaluated for US equivalency
- Professional certifications can supplement formal education requirements

Provide a score between 0.0 and 1.0. Note what educational requirements are met and any gaps.
Reference specific degrees, institutions, and certifications from the resume.
`;
};

export async function scoreEducation(resume: Resume, job: JobDescription): Promise<ScoreResult> {
  return ai.generateStructured({
    schema: ScoreResultSchema,
    prompt: buildPrompt(resume, job),
    system: SYSTEM_PROMPT
  });
}
