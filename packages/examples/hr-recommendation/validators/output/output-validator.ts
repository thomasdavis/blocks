import { Effect } from "effect";
import { scoreSkills } from "../../adapters/skills/index.js";
import { scoreExperience } from "../../adapters/experience/index.js";
import { scoreEducation } from "../../adapters/education/index.js";
import { getRecommendation } from "../../adapters/recommendation/index.js";
import { scoreIndigenousRespect } from "../../adapters/indigenous-respect/index.js";
import { loadTestData } from "./test-data.js";
import { validateScoreResult, validateRecommendation, type ValidationIssue } from "./rules.js";

export interface OutputValidationResult {
  adapter: string;
  passed: boolean;
  issues: ValidationIssue[];
  output?: unknown;
}

export async function validateOutputs(): Promise<OutputValidationResult[]> {
  const results: OutputValidationResult[] = [];
  const { resume, job } = loadTestData();

  // Define adapters to validate
  const adapters = [
    { name: "skills", fn: () => scoreSkills(resume, job) },
    { name: "experience", fn: () => scoreExperience(resume, job) },
    { name: "education", fn: () => scoreEducation(resume, job) },
    { name: "indigenous-respect", fn: () => scoreIndigenousRespect(resume, job) },
  ];

  // Run each adapter and validate output
  for (const adapter of adapters) {
    try {
      const output = await Effect.runPromise(adapter.fn());
      const issues = validateScoreResult(output, resume, job);
      results.push({
        adapter: adapter.name,
        passed: issues.length === 0,
        issues,
        output
      });
    } catch (error) {
      results.push({
        adapter: adapter.name,
        passed: false,
        issues: [{
          rule: "execution",
          message: `Failed to run adapter: ${error instanceof Error ? error.message : String(error)}`,
          actual: null
        }]
      });
    }
  }

  // Run recommendation orchestrator
  try {
    const rec = await Effect.runPromise(getRecommendation(resume, job));
    const issues = validateRecommendation(rec);
    results.push({
      adapter: "recommendation",
      passed: issues.length === 0,
      issues,
      output: rec
    });
  } catch (error) {
    results.push({
      adapter: "recommendation",
      passed: false,
      issues: [{
        rule: "execution",
        message: `Failed to run recommendation: ${error instanceof Error ? error.message : String(error)}`,
        actual: null
      }]
    });
  }

  return results;
}
