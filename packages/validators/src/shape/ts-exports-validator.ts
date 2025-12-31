import type { Validator, ValidatorContext, ValidationResult, ValidationIssue } from "../types.js";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname } from "path";

interface FileAnalysis {
  path: string;
  size: number;
  hasExports: boolean;
  exportCount: number;
  exports: string[];
}

/**
 * TypeScript shape validator - validates file structure and exports
 *
 * This validator is flexible about file naming - it only checks that:
 * 1. At least one .ts file exists in the block folder
 * 2. At least one file has exports
 *
 * blocks.yml is the ONLY required convention - file naming is up to the developer.
 */
export class TsExportsShapeValidator implements Validator {
  id = "shape.exports.ts";

  private analyzeFile(filePath: string, fileName: string): FileAnalysis {
    const content = readFileSync(filePath, "utf-8");
    const size = Buffer.byteLength(content, 'utf-8');

    // Find all exports
    const exportMatches = content.match(/export\s+(const|function|class|type|interface|enum|default|async\s+function)\s+(\w+)?/g) || [];
    const exports = exportMatches.map(match => {
      const parts = match.split(/\s+/);
      return parts[parts.length - 1] || 'default';
    });

    return {
      path: fileName,
      size,
      hasExports: exports.length > 0,
      exportCount: exports.length,
      exports,
    };
  }

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const rulesApplied: string[] = [];
    const filesAnalyzed: string[] = [];
    const fileAnalyses: FileAnalysis[] = [];
    const checksPerformed: string[] = [];

    // Rule: Block path must exist
    rulesApplied.push("path_exists");

    // Check if blockPath exists
    if (!existsSync(context.blockPath)) {
      issues.push({
        type: "error",
        code: "INVALID_PATH",
        message: `Block path does not exist: ${context.blockPath}`,
        suggestion: `Create the block folder at ${context.blockPath}`,
      });
      return {
        valid: false,
        issues,
        context: {
          filesAnalyzed: [],
          rulesApplied,
          summary: `Block path does not exist: ${context.blockPath}`,
          input: { blockPath: context.blockPath },
          output: { error: "Path not found" },
        } as any,
      };
    }

    checksPerformed.push(`✓ Block path exists: ${context.blockPath}`);

    // Check if blockPath is a directory
    let isDirectory = false;
    try {
      isDirectory = statSync(context.blockPath).isDirectory();
    } catch {
      issues.push({
        type: "error",
        code: "INVALID_PATH",
        message: `Cannot read block path: ${context.blockPath}`,
      });
      return { valid: false, issues };
    }

    if (!isDirectory) {
      // Single file block
      rulesApplied.push("single_file_has_exports");
      filesAnalyzed.push(context.blockPath);

      const analysis = this.analyzeFile(context.blockPath, context.blockPath.split('/').pop() || 'block.ts');
      fileAnalyses.push(analysis);
      checksPerformed.push(`Analyzing single file: ${analysis.path}`);
      checksPerformed.push(`  Size: ${analysis.size} bytes`);
      checksPerformed.push(`  Exports found: ${analysis.exportCount}`);

      if (!analysis.hasExports) {
        issues.push({
          type: "warning",
          code: "NO_EXPORTS",
          message: "Block file should export functions or types",
          suggestion: "Add export statements to expose block functionality",
        });
      } else {
        checksPerformed.push(`  ✓ Exports: ${analysis.exports.join(", ")}`);
      }

      const summary = analysis.hasExports
        ? `Single file block validated. Found ${analysis.exportCount} export(s): ${analysis.exports.join(", ")}`
        : `Single file block has no exports. Consider adding export statements.`;

      return {
        valid: true,
        issues,
        context: {
          filesAnalyzed,
          rulesApplied,
          summary,
          input: {
            blockPath: context.blockPath,
            isDirectory: false,
          },
          output: {
            filesAnalyzed: fileAnalyses,
            checksPerformed,
            totalExports: analysis.exportCount,
          },
        } as any,
      };
    }

    // Directory block - check for TypeScript files
    rulesApplied.push("directory_has_ts_files");
    rulesApplied.push("ts_files_have_exports");

    const files = readdirSync(context.blockPath);
    const tsFiles = files.filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'));
    const allFiles = files.filter(f => {
      const fullPath = join(context.blockPath, f);
      try {
        return statSync(fullPath).isFile();
      } catch {
        return false;
      }
    });

    checksPerformed.push(`Directory contains ${allFiles.length} file(s)`);
    checksPerformed.push(`  TypeScript files: ${tsFiles.length}`);
    checksPerformed.push(`  Other files: ${allFiles.length - tsFiles.length}`);

    if (tsFiles.length === 0) {
      issues.push({
        type: "error",
        code: "NO_TS_FILES",
        message: "No TypeScript files found in block folder",
        suggestion: `Create at least one .ts file in ${context.blockPath}`,
      });
      return {
        valid: false,
        issues,
        context: {
          filesAnalyzed: allFiles,
          rulesApplied,
          summary: `No TypeScript files found in block folder. Found ${allFiles.length} other file(s).`,
          input: {
            blockPath: context.blockPath,
            isDirectory: true,
            allFiles,
          },
          output: {
            checksPerformed,
            tsFileCount: 0,
            totalFiles: allFiles.length,
          },
        } as any,
      };
    }

    // Analyze each TypeScript file
    let totalExports = 0;
    const allExports: string[] = [];

    for (const file of tsFiles) {
      const filePath = join(context.blockPath, file);
      filesAnalyzed.push(file);

      const analysis = this.analyzeFile(filePath, file);
      fileAnalyses.push(analysis);
      totalExports += analysis.exportCount;
      allExports.push(...analysis.exports);

      checksPerformed.push(`\nAnalyzing: ${file}`);
      checksPerformed.push(`  Size: ${analysis.size} bytes`);
      checksPerformed.push(`  Exports: ${analysis.exportCount}`);
      if (analysis.exports.length > 0) {
        checksPerformed.push(`  ✓ ${analysis.exports.join(", ")}`);
      }
    }

    // Check that at least one file has exports
    const hasExports = fileAnalyses.some(f => f.hasExports);

    if (!hasExports) {
      issues.push({
        type: "warning",
        code: "NO_EXPORTS",
        message: "No exports found in any TypeScript file",
        suggestion: "Add export statements to expose block functions",
      });
    }

    const valid = issues.filter((i) => i.type === "error").length === 0;
    const summary = hasExports
      ? `Shape validation passed. Analyzed ${tsFiles.length} TypeScript file(s) with ${totalExports} total export(s): ${allExports.slice(0, 5).join(", ")}${allExports.length > 5 ? ` and ${allExports.length - 5} more` : ''}`
      : `Shape validation passed with warnings. Found ${tsFiles.length} TypeScript file(s) but no exports.`;

    return {
      valid,
      issues,
      context: {
        filesAnalyzed,
        rulesApplied,
        summary,
        input: {
          blockPath: context.blockPath,
          isDirectory: true,
          allFiles,
        },
        output: {
          filesAnalyzed: fileAnalyses,
          checksPerformed,
          tsFileCount: tsFiles.length,
          totalFiles: allFiles.length,
          totalExports,
          allExports,
        },
      } as any,
    };
  }
}
