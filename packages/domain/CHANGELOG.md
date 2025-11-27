# @blocks/domain

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
