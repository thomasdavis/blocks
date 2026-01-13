import type { BlockDefinition } from "@blocksai/schema";
import { DomainAnalyzer, DomainRegistry } from "@blocksai/domain";
import { AIProvider } from "@blocksai/ai";
import type {
  Validator,
  ValidatorContext,
  ValidationResult,
  ValidationIssue,
} from "../types.js";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";
import pLimit from "p-limit";
import { minimatch } from "minimatch";

/**
 * Read all files from a block directory recursively
 * Excludes: node_modules, dist, build, .git, and other build artifacts
 * Also respects custom exclude patterns from block config
 */
function readAllBlockFiles(
  blockPath: string,
  excludePatterns: string[] = []
): Record<string, string> {
  const files: Record<string, string> = {};
  const excludeDirs = [
    "node_modules",
    "dist",
    "build",
    ".git",
    ".turbo",
    "coverage",
  ];
  const excludeFiles = [
    ".DS_Store",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
  ];

  function shouldExclude(relativePath: string): boolean {
    return excludePatterns.some((pattern) => minimatch(relativePath, pattern));
  }

  function readDir(dir: string, relativePath: string = "") {
    if (!existsSync(dir)) {
      return;
    }

    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relPath = relativePath ? join(relativePath, entry.name) : entry.name;

      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name) && !shouldExclude(relPath)) {
          readDir(fullPath, relPath);
        }
      } else {
        if (
          !excludeFiles.includes(entry.name) &&
          !shouldExclude(relPath)
        ) {
          try {
            files[relPath] = readFileSync(fullPath, "utf-8");
          } catch {
            // Skip files that can't be read (binary, permission issues, etc.)
            console.warn(`Could not read file: ${relPath}`);
          }
        }
      }
    }
  }

  readDir(blockPath);
  return files;
}

/**
 * Resolve block files - handles both single files and directories
 * If path points to a file, returns just that file
 * If path points to a directory, returns all files recursively
 */
function resolveBlockFiles(
  blockPath: string,
  excludePatterns: string[] = []
): Record<string, string> {
  if (!existsSync(blockPath)) {
    return {};
  }

  const stat = statSync(blockPath);

  if (stat.isFile()) {
    // Single file - use filename as key
    const fileName = basename(blockPath);
    try {
      const content = readFileSync(blockPath, "utf-8");
      return { [fileName]: content };
    } catch {
      console.warn(`Could not read file: ${blockPath}`);
      return {};
    }
  }

  if (stat.isDirectory()) {
    // Directory - read all files recursively (existing behavior)
    return readAllBlockFiles(blockPath, excludePatterns);
  }

  return {};
}

/**
 * Domain validator - validates semantic alignment with domain spec
 * Updated for Blocks Spec v2.0
 */
export class DomainValidator implements Validator {
  id = "domain.validation";

  private ai: AIProvider;
  private registry: DomainRegistry;
  private analyzer: DomainAnalyzer;
  private onFailure: "warn" | "error" | "skip";

  constructor(config: any, ai: AIProvider) {
    this.ai = ai;
    this.registry = new DomainRegistry(config);
    this.analyzer = new DomainAnalyzer(this.registry);
    // Get on_failure from config.ai, default to "warn"
    this.onFailure = config.ai?.on_failure ?? "warn";
  }

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const block: BlockDefinition = context.config.blocks[context.blockName];

    // Check if this block should skip domain validation
    if (this.registry.shouldSkipValidator(context.blockName, "domain")) {
      return {
        valid: true,
        issues: [],
        context: {
          filesAnalyzed: [],
          rulesApplied: [],
          philosophy: [],
          summary: "Skipped - block has skip_validators: [domain]",
        },
      };
    }

    // If on_failure is "skip", skip AI validation entirely
    if (this.onFailure === "skip") {
      return {
        valid: true,
        issues: [],
        context: {
          filesAnalyzed: [],
          rulesApplied: [],
          philosophy: [],
          summary: "Skipped - ai.on_failure is set to 'skip'",
        },
      };
    }

    // First, run static domain analysis
    const domainIssues = this.analyzer.analyzeBlock(context.blockName, block);
    for (const issue of domainIssues) {
      issues.push({
        type: issue.type,
        code: issue.code,
        message: issue.message,
        suggestion: issue.suggestion,
      });
    }

    // Get exclude patterns for this block
    const excludePatterns = this.registry.getBlockExcludePatterns(
      context.blockName
    );

    // Read block files (single file or directory)
    const blockFiles = resolveBlockFiles(context.blockPath, excludePatterns);
    const filesAnalyzed = Object.keys(blockFiles);

    if (filesAnalyzed.length === 0) {
      issues.push({
        type: "error",
        code: "MISSING_IMPLEMENTATION",
        message: "No implementation files found in block directory",
      });
      return {
        valid: false,
        issues,
        context: { filesAnalyzed: [], rulesApplied: [], philosophy: [] },
      };
    }

    // Get merged domain rules for this block (v2.0: from validator config + block overrides)
    const domainRulesWithIds = this.registry.getBlockDomainRules(
      context.blockName
    );
    const domainRules = domainRulesWithIds.map((r) => r.description);
    const philosophy = context.config.philosophy ?? [];

    // Capture rule IDs for context
    const rulesApplied = domainRulesWithIds.map((r) => r.id);

    // Get concurrency level (default to 1 for sequential execution)
    const concurrency = context.concurrency ?? 1;

    // Use AI to validate semantic alignment with all block files
    try {
      // If concurrency > 1 and we have multiple rules, run rules in parallel
      if (concurrency > 1 && domainRulesWithIds.length > 1) {
        const limit = pLimit(concurrency);
        const blockDefinition = JSON.stringify(block, null, 2);

        // Create tasks for each rule
        const ruleTasks = domainRulesWithIds.map((rule) => {
          return limit(async () => {
            try {
              return await this.ai.validateSingleDomainRule({
                blockName: context.blockName,
                blockDefinition,
                files: blockFiles,
                rule,
                philosophy,
              });
            } catch (error) {
              return {
                ruleId: rule.id,
                isValid: false,
                issues: [
                  {
                    message: `Failed to validate rule ${rule.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
                    severity: "warning" as const,
                    file: "",
                  },
                ],
                summary: `Rule validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                _meta: {
                  provider: "",
                  model: "",
                  prompt: "",
                  systemPrompt: "",
                  response: "",
                },
              };
            }
          });
        });

        // Execute all rule validations in parallel
        const ruleResults = await Promise.all(ruleTasks);

        // Aggregate results
        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        const summaries: string[] = [];

        for (const result of ruleResults) {
          for (const issue of result.issues) {
            issues.push({
              type: issue.severity,
              code: "DOMAIN_SEMANTIC_ISSUE",
              message: `[${result.ruleId}] ${issue.message}`,
              file: issue.file || undefined,
            });
          }
          if (result.summary) {
            summaries.push(`${result.ruleId}: ${result.summary}`);
          }
          if (result._meta.tokensUsed) {
            totalInputTokens += result._meta.tokensUsed.input;
            totalOutputTokens += result._meta.tokensUsed.output;
          }
        }

        const providerInfo = this.ai.getProviderInfo();

        return {
          valid: issues.filter((i) => i.type === "error").length === 0,
          issues,
          context: {
            filesAnalyzed,
            rulesApplied,
            philosophy,
            summary: summaries.join("\n"),
          },
          ai: {
            provider: providerInfo.provider,
            model: providerInfo.model,
            prompt: `[Parallel execution of ${domainRulesWithIds.length} rules with concurrency ${concurrency}]`,
            response: `[${ruleResults.length} rule validations completed]`,
            tokensUsed: { input: totalInputTokens, output: totalOutputTokens },
          },
        };
      }

      // Sequential execution (original behavior)
      const validation = await this.ai.validateDomainSemantics({
        blockName: context.blockName,
        blockDefinition: JSON.stringify(block, null, 2),
        files: blockFiles,
        domainRules,
        philosophy,
      });

      for (const issue of validation.issues) {
        issues.push({
          type: issue.severity,
          code: "DOMAIN_SEMANTIC_ISSUE",
          message: issue.message,
          file: issue.file,
        });
      }

      // Return result with full context and AI metadata
      return {
        valid: issues.filter((i) => i.type === "error").length === 0,
        issues,
        context: {
          filesAnalyzed,
          rulesApplied,
          philosophy,
          summary: validation.summary,
        },
        ai: {
          provider: validation._meta.provider,
          model: validation._meta.model,
          prompt: validation._meta.prompt,
          response: validation._meta.response,
          tokensUsed: validation._meta.tokensUsed,
        },
      };
    } catch (error) {
      // Handle AI failure based on on_failure setting
      const issueType = this.onFailure === "error" ? "error" : "warning";

      issues.push({
        type: issueType,
        code: "AI_VALIDATION_FAILED",
        message: `AI validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });

      return {
        valid: issueType !== "error",
        issues,
        context: {
          filesAnalyzed,
          rulesApplied,
          philosophy,
          summary: `AI validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      };
    }
  }
}
