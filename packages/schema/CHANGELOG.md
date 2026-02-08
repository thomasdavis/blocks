# @blocks/schema

## 1.2.0

### Minor Changes

- 79c7902: **Add database storage and public registry**
  - New `@blocksai/store` package for persistent database-backed storage of Blocks specifications
  - Supports SQLite, PostgreSQL, and libSQL/Turso via Drizzle ORM
  - New `blocks store` CLI commands: `init`, `push`, and `pull` for managing remote block storage
  - Added `sources` configuration to schema for pulling block specs from databases or files
  - Source resolution with deep merging (local config wins on conflicts)

## 1.1.0

### Minor Changes

- 6b372c1: Implement Blocks Specification v2.0

  Breaking changes:
  - Remove `root` field - use explicit `path` on each block
  - Merge `signals` and `measures` into unified `semantics` concept
  - Move `domain_rules` from block level to validator config

  New features:
  - Add `$schema: "blocks/v2"` version declaration
  - Add `exclude` patterns for file exclusion per block
  - Add `skip_validators` for opting out of specific validators
  - Add `ai.on_failure` configuration (warn/error/skip)
  - Add `cache.path` configuration for monorepos
  - Add block-level validator overrides with deep merge
  - Add entity field optionality with `optional` array

## 1.0.0

### Major Changes

- Remove visual validation functionality

  Removed all visual validation functionality from Blocks, including the entire `@blocksai/visual-validators` package, schema fields, and AI methods. Visual validation was implemented but never integrated into the CLI or validation pipeline.

  **Removed:**
  - `@blocksai/visual-validators` package (entire package deleted)
  - `visual_validation` field from BlockDefinitionSchema
  - `test_samples` field from BlockDefinitionSchema
  - `validateVisualSemantics()` method from AIProvider

  **Enhanced:**
  - `test_data` field now accepts `string | any` (file path OR inline data)

  **Breaking Changes:**

  ```yaml
  # Before
  blocks:
    my_block:
      test_data: "test-data/sample.json"
      test_samples:  # REMOVED
        - { id: 1 }
      visual_validation:  # REMOVED (was never functional)
        viewports: [...]

  # After - Option 1: File path (unchanged)
  blocks:
    my_block:
      test_data: "test-data/sample.json"

  # After - Option 2: Inline data (new)
  blocks:
    my_block:
      test_data: { id: 1, name: "Sample" }

  # After - Option 3: Inline array (new)
  blocks:
    my_block:
      test_data: [{ id: 1 }, { id: 2 }]
  ```

  **Migration:**
  - Remove `visual_validation` fields from blocks.yml
  - Replace `test_samples` with inline `test_data` if needed
  - Remove `@blocksai/visual-validators` from dependencies if imported

  **Benefits:**
  - Removed ~600 lines of unused code
  - Removed heavy dependencies (Playwright, axe-core)
  - Faster builds (one less package)
  - Clearer focus on development-time source code validation

### Minor Changes

- Add blocks.domain_rules for DRY domain validation

  Implement default domain rules at the `blocks.domain_rules` level to eliminate duplication across similar blocks. This allows defining shared domain rules once that apply to all blocks by default.

  **New Feature:**
  - Define default domain rules at `blocks.domain_rules`
  - Blocks inherit defaults automatically
  - Blocks can override by defining their own `domain_rules` (explicit beats implicit)

  **Example:**

  ```yaml
  blocks:
    domain_rules:
      - id: semantic_html
        description: "Must use semantic HTML tags..."

    theme.modern:
      # Inherits domain_rules automatically

    theme.creative:
      domain_rules:
        # Overrides defaults completely
        - id: creative_freedom
  ```

  **Breaking Changes:** None - backward compatible (domain_rules is optional)

  **Migration:** Existing configs work unchanged. Can optionally refactor to use default rules to reduce duplication.

## 0.2.0

### Minor Changes

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

## 0.1.0

### Minor Changes

- Initial release of Blocks - Domain-driven validation and orchestration for agentic coding workflows
  - Complete schema validation system with Zod
  - Domain modeling engine (entities, signals, measures)
  - AI-powered semantic validation using Vercel AI SDK v6
  - Multi-layer validators (schema, shape, domain)
  - Fully functional CLI with `init` and `run` commands
  - Comprehensive documentation and guides
