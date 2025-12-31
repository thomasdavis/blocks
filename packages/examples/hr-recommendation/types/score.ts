import { z } from "zod";

/**
 * Score result schema for individual adapters
 */
export const ScoreResultSchema = z.object({
  score: z.number().min(0).max(1),
  reasoning: z.string(),
  matched_items: z.array(z.string()),
  gaps: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export type ScoreResult = z.infer<typeof ScoreResultSchema>;

/**
 * Final recommendation schema (orchestrator output)
 */
export const RecommendationSchema = z.object({
  overall_score: z.number().min(0).max(1),
  skill_score: z.number().min(0).max(1),
  experience_score: z.number().min(0).max(1),
  education_score: z.number().min(0).max(1),
  summary: z.string(),
  hire_decision: z.enum(["strong_yes", "yes", "maybe", "no", "strong_no"]),
  key_strengths: z.array(z.string()),
  key_concerns: z.array(z.string()),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;
