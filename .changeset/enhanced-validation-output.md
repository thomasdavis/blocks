---
"@blocksai/validators": minor
"@blocksai/ai": minor
"@blocksai/cli": minor
"@blocksai/domain": patch
---

feat: Enhanced validation output with full context and AI metadata

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
