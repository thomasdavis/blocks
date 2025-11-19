# @blocks/ai

## 1.0.0

### Major Changes

- # Major Architecture Refactor: Development-Time Validation

  This release contains a fundamental architectural refactor that changes how Blocks validates code.

  ## Breaking Changes

  ### Domain Validator Now Reads ALL Files

  **Before:** Domain validator only read `block.ts`

  **After:** Domain validator recursively reads all files in block directory and passes complete context to AI

  **Impact:** Block implementations with validation logic should be simplified. The domain validator will now analyze template files, utility files, and all source code together.

  ### AI Validation Interface Changed

  **Before:**

  ```typescript
  await ai.validateDomainSemantics({
    code: string,
    domainRules: string[],
  });
  ```

  **After:**

  ```typescript
  await ai.validateDomainSemantics({
    files: Record<string, string>,
    philosophy: string[],
    domainRules: string[],
  });
  ```

  ## New Features

  ### Test Data Configuration

  Added `test_data` and `test_samples` fields to block definitions:

  ```yaml
  blocks:
    my_block:
      test_data: "test-data/sample.json"
      test_samples:
        - { field: "value" }
  ```

  ### Blocks Philosophy Context

  Domain validator now includes project philosophy in AI prompts, helping AI understand the domain better.

  ### Comprehensive Documentation
  - Added `docs/validators-architecture.md` - Complete validator architecture guide
  - Updated CLAUDE.md with development philosophy section
  - Documented development-time vs runtime validation
  - Added common mistakes and success patterns

  ## Recommended Migration

  ### Simplify Block Implementations

  Remove runtime validation logic from blocks:

  **Before:**

  ```typescript
  export function theme(resume: Resume) {
    const html = template(resume);

    // Remove this validation
    if (!html.includes('<header>')) throw new Error(...);
    validateAccessibility(html);
    // ... more validation

    return { html };
  }
  ```

  **After:**

  ```typescript
  export function theme(resume: Resume) {
    // Keep only input validation
    if (!resume.basics?.name) {
      throw new Error("Missing required field");
    }

    return { html: template(resume) };
  }
  ```

  Domain validation happens at development time by analyzing source files.

  ## Philosophy

  Blocks is a **development-time validator** that analyzes source code, not a runtime validator. Templates are deterministic - if the source passes validation during development, it will produce correct output at runtime.

  **Key principle:** Validate SOURCE CODE at development time. Trust validated code at runtime.

### Patch Changes

- Updated dependencies
  - @blocksai/schema@0.2.0
  - @blocksai/domain@0.1.1

## 0.1.0

### Minor Changes

- Initial release of Blocks - Domain-driven validation and orchestration for agentic coding workflows
  - Complete schema validation system with Zod
  - Domain modeling engine (entities, signals, measures)
  - AI-powered semantic validation using Vercel AI SDK v6
  - Multi-layer validators (schema, shape, domain)
  - Fully functional CLI with `init` and `run` commands
  - Comprehensive documentation and guides

### Patch Changes

- Updated dependencies
  - @blocks/schema@0.1.0
  - @blocks/domain@0.1.0
