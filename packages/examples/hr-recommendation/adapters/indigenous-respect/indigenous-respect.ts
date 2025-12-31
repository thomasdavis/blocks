import { Effect } from "effect";
import { AIProvider } from "@blocksai/ai";
import { ScoreResultSchema, type Resume, type JobDescription, type ScoreResult } from "../../types/index.js";

const ai = new AIProvider({ provider: "openai", model: "gpt-4.1-mini" });

const SYSTEM_PROMPT = `You are an expert HR analyst specializing in cultural competency assessment for the American job market.
Evaluate candidates based on their demonstrated awareness, respect, and engagement with indigenous cultures and perspectives.
Apply the Cultural Intelligence (CQ) framework to assess cross-cultural competency.
Consider experience with tribal nations, indigenous communities, and First Nations organizations.
Handle missing cultural experience data gracefully - absence of explicit experience does not indicate lack of respect.
Be mindful of EEOC compliance - evaluate demonstrated behaviors and experiences, not assumptions.
Always provide specific reasoning with concrete examples from the resume.`;

const buildPrompt = (resume: Resume, job: JobDescription): string => {
  const workHistory = resume.work?.map(w =>
    `- **${w.position}** at ${w.name} (${w.startDate} - ${w.endDate || "present"})
  ${w.summary || ""}
  Highlights: ${w.highlights?.join("; ") || "None listed"}`
  ).join("\n\n") || "No work experience listed";

  const projects = resume.projects?.map(p =>
    `- **${p.name}**: ${p.description || "No description"}
  Highlights: ${p.highlights?.join("; ") || "None listed"}`
  ).join("\n\n") || "No projects listed";

  const certifications = resume.certifications?.map(c =>
    `- ${c.name} (${c.issuer || "Unknown issuer"}, ${c.date || "Unknown date"})`
  ).join("\n") || "None";

  return `
Evaluate the candidate's cultural awareness and respect for indigenous perspectives.

## Job Context
**Title:** ${job.title}
**Responsibilities:** ${job.responsibilities?.join(", ") || "Not specified"}

## Candidate Work History
${workHistory}

## Projects & Community Involvement
${projects}

## Certifications & Training
${certifications}

## Evaluation Framework: Cultural Intelligence (CQ)
Using the Cultural Intelligence framework, assess:
- **CQ Drive (25%)**: Motivation to learn about and engage with indigenous cultures
- **CQ Knowledge (25%)**: Understanding of indigenous history, sovereignty, and perspectives
- **CQ Strategy (25%)**: Ability to plan for culturally appropriate interactions
- **CQ Action (25%)**: Demonstrated behaviors showing cultural respect

## Scoring Criteria (weights sum to 100%)
- Community engagement: 30% (volunteer work, partnerships with indigenous organizations)
- Cultural training: 25% (certifications, courses, workshops on indigenous awareness)
- Professional experience: 25% (work with tribal nations, indigenous communities, or related orgs)
- Demonstrated respect: 20% (language in resume, project descriptions showing cultural sensitivity)

## Important Guidelines
- If no explicit indigenous-related experience, note as gap but don't penalize unfairly
- Look for transferable indicators: community work, DEI initiatives, cross-cultural experience
- Recognize that cultural competency can be developed - assess growth potential
- EEOC compliance: evaluate behaviors and experiences, not identity or assumptions

Provide a score between 0.0 and 1.0. Identify specific examples of cultural awareness and gaps.
Reference specific experiences, projects, or certifications from the resume.
`;
};

export function scoreIndigenousRespect(resume: Resume, job: JobDescription): Effect.Effect<ScoreResult, Error> {
  return Effect.tryPromise({
    try: () => ai.generateStructured({
      schema: ScoreResultSchema,
      prompt: buildPrompt(resume, job),
      system: SYSTEM_PROMPT
    }),
    catch: (error) => new Error(`Indigenous respect scoring failed: ${error}`)
  });
}
