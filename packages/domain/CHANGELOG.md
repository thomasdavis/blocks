# @blocks/domain

## 0.3.1

### Patch Changes

- Updated dependencies [79c7902]
  - @blocksai/schema@1.2.0

## 0.3.0

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

### Patch Changes

- Updated dependencies [6b372c1]
  - @blocksai/schema@1.1.0

## 0.2.1

### Patch Changes

- 0f855e6: feat: Enhanced validation output with full context and AI metadata

  **@blocksai/validators:**
  - Added `ValidationContext` interface with: `filesAnalyzed`, `rulesApplied`, `philosophy`, `summary`
  - Added `AIMetadata` interface with: `provider`, `model`, `prompt`, `response`, `tokensUsed`
  - Extended `ValidationResult` to include `context` and `ai` fields
  - Domain validator now captures and returns complete validation context

  **@blocksai/ai:**
  - Modified `validateDomainSemantics` to return rich response with full prompt, response, model info, and token usage
  - Added `summary` field to AI validation response
  - Added `getProviderInfo()` method

  **@blocksai/cli:**
  - Extended `ValidatorRunResult` to include `context` and `ai` metadata
  - Run command now passes through rich context from validators to JSON output

  **@blocksai/domain:**
  - Added `getDefaultDomainRuleIds()` method for capturing applied rule IDs

## 0.2.0

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

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @blocksai/schema@1.0.0

## 0.1.1

### Patch Changes

- Updated dependencies
  - @blocksai/schema@0.2.0

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
