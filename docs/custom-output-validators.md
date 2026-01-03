# Building Custom Output Validators

This guide explains how to build custom validators that analyze the **output** of your blocks. Unlike the built-in validators that analyze source code, output validators execute your block with test data and validate what it produces.

## Overview

Output validators are useful when you need to:

- Validate rendered HTML/CSS for accessibility
- Check generated JSON against a schema
- Verify API responses meet requirements
- Ensure generated content follows style guidelines
- Validate transformed data correctness

## Validator Interface

Every validator must implement this interface:

```typescript
interface Validator {
  id: string;
  validate(context: ValidatorContext): Promise<ValidationResult>;
}

interface ValidatorContext {
  blockName: string;      // e.g., "theme.modern"
  blockPath: string;      // e.g., "/path/to/blocks/theme.modern"
  config: BlocksConfig;   // Full blocks.yml configuration
  concurrency?: number;   // Optional parallelism hint
}

interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  context?: ValidationContext;  // Optional metadata
  ai?: AIMetadata;              // Optional AI metadata
}

interface ValidationIssue {
  type: "error" | "warning" | "info";
  code: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  suggestion?: string;
}
```

## Example: HTML Accessibility Validator

This validator executes a block, renders its output, and validates accessibility:

```typescript
// validators/a11y-output-validator.ts
import type { Validator, ValidatorContext, ValidationResult, ValidationIssue } from "@blocksai/validators";
import { existsSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";

export class A11yOutputValidator implements Validator {
  id = "output.accessibility";

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const blockDef = context.config.blocks[context.blockName];

    // 1. Load the block's implementation
    const blockPath = join(context.blockPath, "index.ts");
    if (!existsSync(blockPath)) {
      return {
        valid: false,
        issues: [{
          type: "error",
          code: "BLOCK_NOT_FOUND",
          message: `Block implementation not found at ${blockPath}`,
        }],
      };
    }

    try {
      // 2. Dynamically import the block
      const blockModule = await import(pathToFileURL(blockPath).href);
      const blockFn = blockModule.default || blockModule[context.blockName];

      if (!blockFn) {
        return {
          valid: false,
          issues: [{
            type: "error",
            code: "NO_EXPORT",
            message: "Block does not export a default function",
          }],
        };
      }

      // 3. Load test data (from .blocks/test-data/ or block config)
      const testData = await this.loadTestData(context);

      // 4. Execute the block with test data
      const output = await blockFn(testData);

      // 5. Validate the output
      if (typeof output.html === "string") {
        const a11yIssues = await this.validateHtmlAccessibility(output.html);
        issues.push(...a11yIssues);
      }

      return {
        valid: issues.filter(i => i.type === "error").length === 0,
        issues,
        context: {
          filesAnalyzed: [blockPath],
          summary: `Validated ${context.blockName} output for accessibility`,
        },
      };
    } catch (error) {
      return {
        valid: false,
        issues: [{
          type: "error",
          code: "EXECUTION_FAILED",
          message: `Failed to execute block: ${error instanceof Error ? error.message : "Unknown error"}`,
        }],
      };
    }
  }

  private async loadTestData(context: ValidatorContext): Promise<any> {
    // Look for test data in standard locations
    const testDataPaths = [
      join(context.blockPath, "test-data.json"),
      join(context.blockPath, "..", "..", ".blocks", "test-data", `${context.blockName}.json`),
    ];

    for (const path of testDataPaths) {
      if (existsSync(path)) {
        const { readFileSync } = await import("fs");
        return JSON.parse(readFileSync(path, "utf-8"));
      }
    }

    // Return empty object if no test data found
    return {};
  }

  private async validateHtmlAccessibility(html: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Check for common accessibility issues
    // (In production, use a library like axe-core or pa11y)

    // Check for missing alt attributes on images
    const imgWithoutAlt = /<img(?![^>]*\balt=)[^>]*>/gi;
    const matches = html.match(imgWithoutAlt);
    if (matches) {
      for (const match of matches) {
        issues.push({
          type: "error",
          code: "MISSING_ALT",
          message: "Image is missing alt attribute",
          suggestion: "Add alt attribute to describe the image",
        });
      }
    }

    // Check for missing aria-labels on interactive elements
    const buttonWithoutLabel = /<button(?![^>]*\baria-label)[^>]*>[\s]*<\/button>/gi;
    if (buttonWithoutLabel.test(html)) {
      issues.push({
        type: "warning",
        code: "EMPTY_BUTTON",
        message: "Button has no text or aria-label",
        suggestion: "Add text content or aria-label attribute",
      });
    }

    // Check for heading hierarchy
    const headings = html.match(/<h([1-6])[^>]*>/gi) || [];
    let lastLevel = 0;
    for (const heading of headings) {
      const level = parseInt(heading.match(/<h([1-6])/i)?.[1] || "1");
      if (level > lastLevel + 1) {
        issues.push({
          type: "warning",
          code: "HEADING_SKIP",
          message: `Heading level skipped from h${lastLevel} to h${level}`,
          suggestion: "Use sequential heading levels for proper document structure",
        });
      }
      lastLevel = level;
    }

    // Check for semantic HTML
    const hasMain = /<main[\s>]/i.test(html);
    const hasNav = /<nav[\s>]/i.test(html);
    const hasHeader = /<header[\s>]/i.test(html);

    if (!hasMain) {
      issues.push({
        type: "info",
        code: "NO_MAIN",
        message: "Consider using <main> element for primary content",
      });
    }

    return issues;
  }
}
```

## Example: JSON Schema Output Validator

This validator checks that block output matches a JSON schema:

```typescript
// validators/json-schema-output-validator.ts
import type { Validator, ValidatorContext, ValidationResult, ValidationIssue } from "@blocksai/validators";
import Ajv from "ajv";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";

export class JsonSchemaOutputValidator implements Validator {
  id = "output.json-schema";
  private ajv = new Ajv({ allErrors: true });

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const blockDef = context.config.blocks[context.blockName];

    // Get schema from validator config in blocks.yml
    const validatorConfig = this.getValidatorConfig(context);
    if (!validatorConfig?.schema) {
      return {
        valid: true,
        issues: [{
          type: "info",
          code: "NO_SCHEMA",
          message: "No JSON schema configured for output validation",
        }],
      };
    }

    try {
      // Load and execute block
      const blockPath = join(context.blockPath, "index.ts");
      const blockModule = await import(pathToFileURL(blockPath).href);
      const blockFn = blockModule.default || Object.values(blockModule)[0];

      // Load test data
      const testData = this.loadTestData(context);

      // Execute block
      const output = await blockFn(testData);

      // Validate against schema
      const validate = this.ajv.compile(validatorConfig.schema);
      const valid = validate(output);

      if (!valid && validate.errors) {
        for (const error of validate.errors) {
          issues.push({
            type: "error",
            code: "SCHEMA_VIOLATION",
            message: `${error.instancePath || "root"}: ${error.message}`,
            suggestion: `Expected ${JSON.stringify(error.params)}`,
          });
        }
      }

      return {
        valid: issues.length === 0,
        issues,
        context: {
          summary: valid
            ? "Output matches JSON schema"
            : `${validate.errors?.length} schema violations found`,
        },
      };
    } catch (error) {
      return {
        valid: false,
        issues: [{
          type: "error",
          code: "VALIDATION_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        }],
      };
    }
  }

  private getValidatorConfig(context: ValidatorContext): any {
    // Look for validator config in block definition
    const blockDef = context.config.blocks[context.blockName];
    return blockDef?.validators?.["output.json-schema"];
  }

  private loadTestData(context: ValidatorContext): any {
    const testDataPath = join(context.blockPath, "test-data.json");
    if (existsSync(testDataPath)) {
      return JSON.parse(readFileSync(testDataPath, "utf-8"));
    }
    return {};
  }
}
```

## Example: AI-Powered Output Validator

This validator uses AI to analyze the quality of generated content:

```typescript
// validators/ai-output-validator.ts
import type { Validator, ValidatorContext, ValidationResult, ValidationIssue } from "@blocksai/validators";
import { AIProvider } from "@blocksai/ai";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";

export class AIOutputValidator implements Validator {
  id = "output.ai-quality";
  private ai: AIProvider;

  constructor(config: any, ai: AIProvider) {
    this.ai = ai;
  }

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const blockDef = context.config.blocks[context.blockName];

    try {
      // Execute block
      const blockPath = join(context.blockPath, "index.ts");
      const blockModule = await import(pathToFileURL(blockPath).href);
      const blockFn = blockModule.default || Object.values(blockModule)[0];
      const testData = this.loadTestData(context);
      const output = await blockFn(testData);

      // Get quality criteria from config
      const criteria = this.getQualityCriteria(context);

      // Use AI to validate output quality
      const validation = await this.ai.validateDomainSemantics({
        blockName: context.blockName,
        blockDefinition: JSON.stringify(blockDef, null, 2),
        files: {
          "output.json": JSON.stringify(output, null, 2),
          "output.html": output.html || "",
        },
        domainRules: criteria,
        philosophy: context.config.philosophy || [],
      });

      for (const issue of validation.issues) {
        issues.push({
          type: issue.severity,
          code: "OUTPUT_QUALITY_ISSUE",
          message: issue.message,
        });
      }

      return {
        valid: issues.filter(i => i.type === "error").length === 0,
        issues,
        context: {
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
      return {
        valid: false,
        issues: [{
          type: "error",
          code: "VALIDATION_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        }],
      };
    }
  }

  private getQualityCriteria(context: ValidatorContext): string[] {
    const blockDef = context.config.blocks[context.blockName];
    const validatorConfig = blockDef?.validators?.["output.ai-quality"];
    return validatorConfig?.criteria || [
      "Output is well-formed and complete",
      "Content is accurate and relevant",
      "No placeholder or Lorem ipsum text",
    ];
  }

  private loadTestData(context: ValidatorContext): any {
    const testDataPath = join(context.blockPath, "test-data.json");
    if (existsSync(testDataPath)) {
      return JSON.parse(readFileSync(testDataPath, "utf-8"));
    }
    return {};
  }
}
```

## Configuring Output Validators in blocks.yml

```yaml
$schema: "blocks/v2"
name: my-project

validators:
  - schema
  - shape.ts
  - domain
  # Custom output validators
  - name: output.accessibility
    run: "./validators/a11y-output-validator.ts"
  - name: output.json-schema
    run: "./validators/json-schema-output-validator.ts"
    config:
      schema:
        type: object
        required: [html]
        properties:
          html: { type: string }
  - name: output.ai-quality
    run: "./validators/ai-output-validator.ts"

blocks:
  theme.modern:
    description: "Modern resume theme"
    path: themes/modern
    inputs:
      - name: resume
        type: Resume
    outputs:
      - name: html
        type: string
    # Block-specific validator config
    validators:
      output.accessibility:
        level: AA  # WCAG level
      output.ai-quality:
        criteria:
          - "HTML uses semantic elements"
          - "Contact info is prominently displayed"
          - "Print styles are optimized"
```

## Providing Test Data

Output validators need test data to execute blocks. Create test data files:

```
project/
├── blocks.yml
├── .blocks/
│   └── test-data/
│       ├── theme.modern.json      # Test data for theme.modern
│       └── theme.classic.json     # Test data for theme.classic
└── blocks/
    └── theme.modern/
        ├── block.ts
        ├── index.ts
        └── test-data.json         # Or place test data in block dir
```

Example test data (`theme.modern.json`):

```json
{
  "resume": {
    "basics": {
      "name": "John Doe",
      "email": "john@example.com",
      "label": "Software Engineer"
    },
    "work": [
      {
        "company": "Tech Corp",
        "position": "Senior Developer",
        "startDate": "2020-01",
        "summary": "Led development of core platform"
      }
    ],
    "skills": [
      { "name": "TypeScript", "level": "Expert" },
      { "name": "React", "level": "Advanced" }
    ]
  }
}
```

## Registering Custom Validators

### Option 1: Programmatic Registration

```typescript
// my-cli.ts
import { ValidatorRegistry } from "@blocksai/validators";
import { A11yOutputValidator } from "./validators/a11y-output-validator";
import { AIProvider } from "@blocksai/ai";
import { parseBlocksConfig } from "@blocksai/schema";

const config = parseBlocksConfig(yamlContent);
const ai = new AIProvider(config.ai);
const registry = new ValidatorRegistry(config, ai);

// Register custom validator
registry.register("output.accessibility", new A11yOutputValidator());

// Now use it
const validator = registry.get("output.accessibility");
const result = await validator.validate({
  blockName: "theme.modern",
  blockPath: "./blocks/theme.modern",
  config,
});
```

### Option 2: Dynamic Loading (via `run` field)

The CLI can dynamically load validators specified in `blocks.yml`:

```yaml
validators:
  - name: output.accessibility
    run: "./validators/a11y-output-validator.ts"  # Relative to project root
```

The CLI would load this as:

```typescript
async function loadValidator(validatorConfig: any): Promise<Validator> {
  if (validatorConfig.run) {
    const modulePath = join(process.cwd(), validatorConfig.run);
    const module = await import(pathToFileURL(modulePath).href);
    const ValidatorClass = module.default || Object.values(module)[0];
    return new ValidatorClass(config, ai);
  }
  // Fall back to built-in validators
  return registry.get(validatorConfig.name || validatorConfig);
}
```

## Best Practices

### 1. Graceful Error Handling

Always catch errors and return meaningful issues:

```typescript
async validate(context: ValidatorContext): Promise<ValidationResult> {
  try {
    // ... validation logic
  } catch (error) {
    return {
      valid: false,  // or true with warning if non-critical
      issues: [{
        type: "error",
        code: "UNEXPECTED_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        suggestion: "Check block implementation and test data",
      }],
    };
  }
}
```

### 2. Provide Rich Context

Include metadata about what was validated:

```typescript
return {
  valid: true,
  issues: [],
  context: {
    filesAnalyzed: ["index.ts", "template.hbs"],
    rulesApplied: ["semantic_html", "accessibility"],
    summary: "Validated 3 pages with 0 issues",
  },
};
```

### 3. Use Appropriate Severity Levels

- `error`: Validation failed, block should not be deployed
- `warning`: Issue detected, but not blocking
- `info`: Informational, suggestions for improvement

### 4. Make Issues Actionable

Include file paths, line numbers, and suggestions:

```typescript
issues.push({
  type: "error",
  code: "MISSING_ALT",
  message: "Image is missing alt attribute",
  file: "output.html",
  line: 42,
  suggestion: 'Add alt="description" to the img tag',
});
```

### 5. Support Parallel Execution

If your validator can run multiple checks independently:

```typescript
async validate(context: ValidatorContext): Promise<ValidationResult> {
  const concurrency = context.concurrency ?? 1;
  const limit = pLimit(concurrency);

  const checks = [
    () => this.checkAccessibility(output),
    () => this.checkSEO(output),
    () => this.checkPerformance(output),
  ];

  const results = await Promise.all(
    checks.map(check => limit(check))
  );

  return this.aggregateResults(results);
}
```

## Complete Example Project Structure

```
my-project/
├── blocks.yml
├── .blocks/
│   └── test-data/
│       └── theme.modern.json
├── validators/
│   ├── a11y-output-validator.ts
│   ├── seo-output-validator.ts
│   └── performance-output-validator.ts
└── blocks/
    └── theme.modern/
        ├── index.ts
        ├── block.ts
        └── template.hbs
```

**blocks.yml:**

```yaml
$schema: "blocks/v2"
name: resume-themes

philosophy:
  - "Accessibility is non-negotiable"
  - "Performance matters for user experience"
  - "SEO enables discoverability"

validators:
  - schema
  - shape.ts
  - domain
  - name: output.accessibility
    run: "./validators/a11y-output-validator.ts"
    config:
      level: AA
  - name: output.seo
    run: "./validators/seo-output-validator.ts"
  - name: output.performance
    run: "./validators/performance-output-validator.ts"
    config:
      maxBundleSize: 50000
      maxRenderTime: 100

blocks:
  theme.modern:
    description: "Modern professional resume theme"
    path: blocks/theme.modern
    inputs:
      - name: resume
        type: Resume
    outputs:
      - name: html
        type: string
```

## Summary

Custom output validators extend Blocks to validate what your code **produces**, not just the source code itself. Key points:

1. Implement the `Validator` interface with `id` and `validate()` method
2. Load and execute the block with test data
3. Analyze the output for issues
4. Return structured `ValidationResult` with issues and context
5. Configure in `blocks.yml` with the `run` field for custom validators
6. Provide test data in `.blocks/test-data/` or block directories

This pattern enables powerful validation scenarios like accessibility audits, schema validation, and AI-powered quality checks on generated content.
