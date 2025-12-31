import { z } from "zod";

/**
 * JSON Resume schema types
 * Based on https://jsonresume.org/schema
 */

export const BasicsSchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  summary: z.string().optional(),
  location: z.object({
    city: z.string().optional(),
    region: z.string().optional(),
    countryCode: z.string().optional(),
  }).optional(),
  profiles: z.array(z.object({
    network: z.string(),
    url: z.string().optional(),
    username: z.string().optional(),
  })).optional(),
});

export const WorkExperienceSchema = z.object({
  name: z.string(),
  position: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const EducationSchema = z.object({
  institution: z.string(),
  area: z.string().optional(),
  studyType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  score: z.string().optional(),
  courses: z.array(z.string()).optional(),
});

export const SkillSchema = z.object({
  name: z.string(),
  level: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

export const CertificationSchema = z.object({
  name: z.string(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
});

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  url: z.string().optional(),
});

export const ResumeSchema = z.object({
  basics: BasicsSchema.optional(),
  work: z.array(WorkExperienceSchema).optional(),
  education: z.array(EducationSchema).optional(),
  skills: z.array(SkillSchema).optional(),
  certifications: z.array(CertificationSchema).optional(),
  projects: z.array(ProjectSchema).optional(),
});

export type Basics = z.infer<typeof BasicsSchema>;
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Resume = z.infer<typeof ResumeSchema>;
