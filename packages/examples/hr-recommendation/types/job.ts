import { z } from "zod";

/**
 * Job Description schema
 */

export const ExperienceRequirementsSchema = z.object({
  minimum_years: z.number().optional(),
  preferred_years: z.number().optional(),
  required_experience: z.array(z.string()).optional(),
});

export const EducationRequirementsSchema = z.object({
  minimum_degree: z.string().optional(),
  preferred_degree: z.string().optional(),
  preferred_fields: z.array(z.string()).optional(),
});

export const JobDescriptionSchema = z.object({
  title: z.string(),
  department: z.string().optional(),
  location: z.string().optional(),
  required_skills: z.array(z.string()),
  preferred_skills: z.array(z.string()).optional(),
  experience_requirements: ExperienceRequirementsSchema.optional(),
  education_requirements: EducationRequirementsSchema.optional(),
  responsibilities: z.array(z.string()).optional(),
});

export type ExperienceRequirements = z.infer<typeof ExperienceRequirementsSchema>;
export type EducationRequirements = z.infer<typeof EducationRequirementsSchema>;
export type JobDescription = z.infer<typeof JobDescriptionSchema>;
