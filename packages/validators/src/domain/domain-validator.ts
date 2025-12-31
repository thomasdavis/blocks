import type { BlockDefinition } from "@blocksai/schema";
import { DomainAnalyzer, DomainRegistry } from "@blocksai/domain";
import { AIProvider } from "@blocksai/ai";
import type { Validator, ValidatorContext, ValidationResult, ValidationIssue } from "../types.js";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";

/**
 * Read all files from a block directory recursively
 * Excludes: node_modules, dist, build, .git, and other build artifacts
 */
function readAllBlockFiles(blockPath: string): Record<string, string> {
  const files: Record<string, string> = {};
  const excludeDirs = ['node_modules', 'dist', 'build', '.git', '.turbo', 'coverage'];
  const excludeFiles = ['.DS_Store', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'];

  function readDir(dir: string, relativePath: string = '') {
    if (!existsSync(dir)) {
      return;
    }

    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relPath = relativePath ? join(relativePath, entry.name) : entry.name;

      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name)) {
          readDir(fullPath, relPath);
        }
      } else {
        if (!excludeFiles.includes(entry.name)) {
          try {
            files[relPath] = readFileSync(fullPath, 'utf-8');
          } catch (error) {
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
function resolveBlockFiles(blockPath: string): Record<string, string> {
  if (!existsSync(blockPath)) {
    return {};
  }

  const stat = statSync(blockPath);

  if (stat.isFile()) {
    // Single file - use filename as key
    const fileName = basename(blockPath);
    try {
      const content = readFileSync(blockPath, 'utf-8');
      return { [fileName]: content };
    } catch (error) {
      console.warn(`Could not read file: ${blockPath}`);
      return {};
    }
  }

  if (stat.isDirectory()) {
    // Directory - read all files recursively (existing behavior)
    return readAllBlockFiles(blockPath);
  }

  return {};
}

/**
 * Domain validator - validates semantic alignment with domain spec
 */
export class DomainValidator implements Validator {
  id = "domain.validation";

  private ai: AIProvider;
  private registry: DomainRegistry;
  private analyzer: DomainAnalyzer;

  constructor(config: any, ai: AIProvider) {
    this.ai = ai;
    this.registry = new DomainRegistry(config);
    this.analyzer = new DomainAnalyzer(this.registry);
  }

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const block: BlockDefinition = context.config.blocks[context.blockName];

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

    // Read block files (single file or directory)
    const blockFiles = resolveBlockFiles(context.blockPath);
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

    // Use block-specific rules if present, otherwise use defaults from blocks.domain_rules
    const domainRules = block.domain_rules
      ? block.domain_rules.map((r) => r.description)
      : this.registry.getDefaultDomainRules();
    const philosophy = context.config.philosophy ?? [];

    // Capture rule IDs for context
    const rulesApplied = block.domain_rules
      ? block.domain_rules.map((r) => r.id)
      : this.registry.getDefaultDomainRuleIds?.() ?? [];

    // Use AI to validate semantic alignment with all block files
    try {
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
      issues.push({
        type: "warning",
        code: "AI_VALIDATION_FAILED",
        message: `AI validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });

      return {
        valid: issues.filter((i) => i.type === "error").length === 0,
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
