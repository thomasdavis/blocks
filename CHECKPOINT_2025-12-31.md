# Blocks Development Checkpoint - December 31, 2025

## Session Summary

This session focused on enhancing the validator debugging experience, fixing UI bugs, upgrading to AI SDK v6, and publishing new package versions.

---

## Completed Work

### 1. Enhanced Validator Context (All Validators)

All validators now return rich debugging context:

```typescript
interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  context?: {
    filesAnalyzed: string[];      // Files the validator examined
    rulesApplied: string[];       // Rules/checks performed
    summary: string;              // Human-readable summary
    input: any;                   // What was passed to validator
    output: any;                  // Detailed results
  };
  ai?: {
    model: string;
    prompt: string;
    response: string;
    tokensUsed: { input: number; output: number };
  };
}
```

**Files Modified:**
- `packages/validators/src/schema/io-validator.ts` - Added rich context
- `packages/validators/src/shape/ts-exports-validator.ts` - Added file analysis details
- `packages/examples/hr-recommendation/validators/output/blocks-validator.ts` - Full adapter execution data

### 2. Devtools UI Enhancements

- Modern gradient styling with hero cards
- Inline validator summaries showing files/rules counts
- 4-tab modal: Details, Artifacts, AI Context, Raw JSON
- Collapsible sections for files, rules, issues

**Files Modified:**
- `packages/devtools/src/components/run-detail.tsx`
- `packages/devtools/src/components/block-result.tsx`
- `packages/devtools/src/components/validator-detail-modal.tsx`

### 3. Dialog Component Fix

Fixed modal closing when clicking inside content.

**Files Modified:**
- `packages/ui/src/dialog/dialog.tsx`
  - Added `dismissible` prop
  - Added `disablePointerDismissal` to prevent accidental closes
  - Added `onClick` stopPropagation on content

**Usage:**
```tsx
<Dialog open={open} onOpenChange={onOpenChange} dismissible={false}>
  {/* Content won't close on inside clicks */}
</Dialog>
```

### 4. AI SDK v6 Upgrade

Upgraded from AI SDK v4/v5 to v6.

**Breaking Changes Applied:**
- `generateObject` → `generateText` + `Output.object()`
- Token usage: `promptTokens` → `inputTokens`, `completionTokens` → `outputTokens`
- Package versions: `ai@^6.0.0`, `@ai-sdk/*@^3.0.0`

**Files Modified:**
- `packages/ai/package.json` - Updated deps
- `packages/ai/src/provider.ts` - New API usage
- `apps/docs/package.json` - Updated deps

### 5. HR Recommendation Example

Added new adapter and custom output validator:

**New Files:**
- `packages/examples/hr-recommendation/adapters/indigenous-respect/`
- `packages/examples/hr-recommendation/validators/output/`
  - `blocks-validator.ts` - Custom validator with test data execution
  - `rules.ts` - Validation rules
  - `test-data.ts` - Resume/job fixtures

---

## Published Packages

| Package | Version | Notes |
|---------|---------|-------|
| `@blocksai/ai` | 3.0.0 | **Major** - AI SDK v6 |
| `@blocksai/cli` | 0.2.1 | Validator context support |
| `@blocksai/validators` | 1.1.1 | Rich context in all validators |
| `@blocksai/ui` | 0.2.0 | Dialog dismissible prop |
| `@blocksai/devtools` | 0.2.0 | Enhanced debugging UI |
| `@blocksai/domain` | 0.2.1 | Minor updates |

---

## Git Commits

```
4a24998 chore: release @blocksai/ai@3.0.0 with AI SDK v6 + update docs deps
8f46912 feat: Upgrade to Vercel AI SDK v6
9f6325e docs: Add Claude instructions for using Blocks
1687b3c chore: release packages
5169266 feat: Enhanced validator debugging UI with rich context
```

---

## Files Created

1. `BLOCKS_FOR_CLAUDE.md` - Instructions for using Blocks in other repos
2. `CHECKPOINT_2025-12-31.md` - This file

---

## Known Issues / TODO

1. **Modal positioning** - Modal appears at bottom of viewport instead of centered (CSS issue)
2. **Collapsible sections** - Click area may need adjustment for better UX
3. **Domain validator AI errors** - Schema validation errors in AI response format (non-blocking, falls back to warning)

---

## Quick Reference

### Install Blocks in Another Project

```bash
pnpm add @blocksai/cli @blocksai/validators
```

### Run Validation

```bash
npx blocks run adapter.name      # Single block
npx blocks run --all             # All blocks
```

### Environment Variables

```bash
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...
# or
GOOGLE_GENERATIVE_AI_API_KEY=...
```

---

## Architecture Notes

### Validator Pipeline

```
blocks run --all
    │
    ├── Load blocks.yml
    ├── For each block:
    │   ├── schema validator (fast, sync)
    │   ├── shape.ts validator (fast, filesystem)
    │   ├── domain validator (slow, AI-powered)
    │   └── custom validators (configurable)
    └── Output results to .blocks/runs/
```

### Devtools Data Flow

```
.blocks/runs/{timestamp}.json
    │
    └── Devtools reads JSON
        ├── run-detail.tsx (page layout)
        ├── block-result.tsx (per-block cards)
        └── validator-detail-modal.tsx (detailed view)
```

---

## Next Steps

1. Fix modal centering CSS
2. Add more custom validator examples
3. Consider streaming validation results
4. Add validator caching for faster re-runs
