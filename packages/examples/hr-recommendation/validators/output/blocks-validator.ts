import type { Validator, ValidatorContext, ValidationResult, ValidationIssue } from "@blocksai/validators";
import { validateOutputs, type OutputValidationResult } from "./output-validator.js";
import { loadTestData } from "./test-data.js";

interface AdapterExecution {
  adapter: string;
  passed: boolean;
  duration: number;
  issueCount: number;
  output?: unknown;
}

/**
 * Output validator that runs HR adapters with test data
 * and validates the results are substantive and valid.
 *
 * This validator actually executes the adapters at runtime,
 * unlike source-code validators that only check code.
 */
export class OutputValidator implements Validator {
  id = "output.runtime";

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const startTime = Date.now();
    const rulesApplied: string[] = [];
    const adapterExecutions: AdapterExecution[] = [];

    // Load test data for context
    let testData: { resume: any; job: any } | null = null;
    try {
      testData = loadTestData();
    } catch (e) {
      // Test data loading failed
    }

    // Rules we check
    rulesApplied.push(
      "score_range",          // Score must be 0.0-1.0
      "reasoning_length",     // Reasoning must be >= 50 chars
      "reasoning_specific",   // No generic placeholder text
      "matched_in_resume",    // Matched items must exist
      "gap_in_job",          // Gaps must reference job requirements
      "confidence_range",     // Confidence must be 0.0-1.0
      "overall_score_range",  // Recommendation score range
      "hire_decision_consistency", // Decision matches score
      "strengths_present",    // Must have key strengths
      "summary_length"        // Summary >= 100 chars
    );

    try {
      const results = await validateOutputs();
      const totalDuration = Date.now() - startTime;

      let passedCount = 0;
      let failedCount = 0;

      for (const result of results) {
        const execution: AdapterExecution = {
          adapter: result.adapter,
          passed: result.passed,
          duration: 0, // We don't have per-adapter timing yet
          issueCount: result.issues.length,
          output: result.output,
        };
        adapterExecutions.push(execution);

        if (result.passed) {
          passedCount++;
        } else {
          failedCount++;
          for (const issue of result.issues) {
            issues.push({
              type: "error",
              code: issue.rule.toUpperCase(),
              message: `[${result.adapter}] ${issue.message}`,
              suggestion: typeof issue.actual === "object"
                ? `Actual value: ${JSON.stringify(issue.actual).substring(0, 200)}`
                : `Actual value: ${issue.actual}`,
            });
          }
        }
      }

      const summary = issues.length === 0
        ? `Output validation passed. Executed ${results.length} adapter(s) with test data. All outputs conform to domain rules.`
        : `Output validation failed. ${failedCount}/${results.length} adapter(s) failed validation with ${issues.length} issue(s).`;

      return {
        valid: issues.length === 0,
        issues,
        context: {
          filesAnalyzed: [
            "data/resumes/senior-developer.json",
            "data/jobs/backend-engineer.json",
          ],
          rulesApplied,
          summary,
          input: {
            testData: testData ? {
              resumeName: testData.resume?.basics?.name || "Unknown",
              resumeLabel: testData.resume?.basics?.label || "Unknown",
              jobTitle: testData.job?.title || "Unknown",
              requiredSkillsCount: testData.job?.required_skills?.length || 0,
            } : null,
            adaptersToValidate: adapterExecutions.map(e => e.adapter),
          },
          output: {
            totalDuration: `${totalDuration}ms`,
            passedCount,
            failedCount,
            adapters: adapterExecutions.map(e => ({
              name: e.adapter,
              passed: e.passed,
              issueCount: e.issueCount,
              // Include key output fields for visibility
              score: (e.output as any)?.score ?? (e.output as any)?.overall_score,
              reasoning: (e.output as any)?.reasoning?.substring(0, 100) + "..." || (e.output as any)?.summary?.substring(0, 100) + "...",
              confidence: (e.output as any)?.confidence,
              matchedItems: (e.output as any)?.matched_items?.length ?? (e.output as any)?.key_strengths?.length,
              gaps: (e.output as any)?.gaps?.length ?? (e.output as any)?.concerns?.length,
            })),
            fullOutputs: adapterExecutions.reduce((acc, e) => {
              acc[e.adapter] = e.output;
              return acc;
            }, {} as Record<string, unknown>),
          },
        } as any,
      };
    } catch (error) {
      return {
        valid: false,
        issues: [{
          type: "error",
          code: "OUTPUT_VALIDATION_FAILED",
          message: error instanceof Error ? error.message : "Unknown error running output validator",
        }],
        context: {
          filesAnalyzed: [],
          rulesApplied,
          summary: `Output validation failed with error: ${error instanceof Error ? error.message : "Unknown error"}`,
          input: {
            testData: testData ? {
              resumeName: testData.resume?.basics?.name || "Unknown",
              jobTitle: testData.job?.title || "Unknown",
            } : null,
          },
          output: {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          },
        } as any,
      };
    }
  }
}

// Export for dynamic loading
export default OutputValidator;
