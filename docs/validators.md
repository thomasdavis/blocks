# Validator Types

Blocks supports seven types of validators, each serving a different purpose in the validation pipeline.

## 1. Schema Validators

**Purpose:** Validate data structures and type signatures.

**Examples:**
- `schema.io.v1` - validates input/output signatures
- Check that all inputs have name and type
- Check that outputs reference valid measures
- Check that types reference valid entities

**When they run:** First in the pipeline (deterministic, fast).

## 2. Shape Validators

**Purpose:** Validate file structure, exports, and code layout.

**Examples:**
- `shape.exports.v1` - validates that required files exist
- Check for `index.ts`, `block.ts`
- Check that exports are present
- Validate naming conventions

**When they run:** After schema validation (deterministic).

## 3. Lint Validators

**Purpose:** Static code analysis for quality and maintainability.

**Examples:**
- `lint.quality.v1` - runs ESLint or similar
- Complexity checks
- Code smell detection
- Security pattern checks

**When they run:** After shape validation (deterministic, can be slow).

**Status:** Not yet implemented.

## 4. Domain Validators

**Purpose:** Validate semantic alignment with domain specification.

**Examples:**
- `domain.validation.v1` - AI-powered semantic validation
- Check that code expresses domain intent
- Validate domain rules compliance
- Detect undocumented concepts (drift)

**When they run:** After basic validation passes (uses AI, slower).

**Key Features:**
- Uses `DomainAnalyzer` for static checks
- Uses `AIProvider` for semantic validation
- Can detect new concepts not in spec
- Suggests spec updates

## 5. Chain Validators

**Purpose:** Multi-step validation pipelines where each step depends on the previous.

**Examples:**
- Translation quality chain:
  1. `translation.detect_language.v1` - detect language
  2. `translation.semantic_match.v1` - validate meaning
  3. `translation.heuristic_quality.v1` - score quality

**When they run:** As a sequence in the pipeline.

**Status:** Framework exists, not yet implemented.

## 6. Shadow Validators

**Purpose:** Run validators that don't halt the pipeline. Used for advisory feedback.

**Examples:**
- `execution.shadow_eval.v1` - run with mock data
- Layout density scoring (templates)
- Spanish quality heuristics
- Semantic quality scores

**When they run:** In parallel with main pipeline (don't block on failure).

**Status:** Not yet implemented.

## 7. Scoring Validators

**Purpose:** Produce numeric scores for dashboards and metrics.

**Examples:**
- `scoring.block_quality.v1` - overall block quality (0-1)
- Spanish quality score
- Template layout score
- Facet reliability score

**When they run:** At the end of the pipeline.

**Output:** Numeric score + reasoning.

**Status:** Framework exists in AIProvider, not yet implemented as validators.

## Validator Interface

All validators implement:

```typescript
interface Validator {
  id: string;
  validate(context: ValidatorContext): Promise<ValidationResult>;
}
```

Where:

```typescript
interface ValidatorContext {
  blockName: string;
  blockPath: string;
  config: any; // blocks.yml parsed
}

interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

interface ValidationIssue {
  type: "error" | "warning" | "info";
  code: string;
  message: string;
  file?: string;
  line?: number;
  suggestion?: string;
}
```

## Adding New Validators

1. Implement the `Validator` interface
2. Add to appropriate category in `@blocks/validators`
3. Register in `blocks.yml` under `validators`
4. Add to pipeline in `blocks.yml`

Example:

```yaml
validators:
  lint:
    - id: eslint_check
      run: "lint.eslint.v1"

pipeline:
  steps:
    - id: lint
      run: "lint.eslint.v1"
```
