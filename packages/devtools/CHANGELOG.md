# @blocksai/devtools

## 0.2.1

### Patch Changes

- 486c1cd: fix: move TypeScript and build dependencies to dependencies (not devDependencies)

  When devtools is installed as a standalone package and run via `blocks-devtools`,
  devDependencies aren't installed, causing TypeScript parsing errors. This moves
  the necessary dependencies so they're available at runtime.

## 0.2.0

### Minor Changes

- 0f855e6: feat: Enhanced devtools UI with full validation visibility
  - Added **JsonViewer** component - collapsible JSON tree with syntax highlighting and copy button
  - Added **ValidatorDetailModal** - displays full validation context including:
    - Summary explaining why validation passed or failed
    - List of files analyzed
    - Domain rules applied
    - Full AI prompt and response
    - Token usage statistics
  - Updated **RunDetail** page with:
    - Tabs for "Block Results" and "Raw JSON" views
    - Summary display for each validator
    - "Details" button to open validator modal

- Enhanced validator debugging with rich context
  - All validators now return detailed context: filesAnalyzed, rulesApplied, summary, input/output
  - Schema validator shows validation checks performed
  - Shape validator shows file analysis with export details
  - Domain validator shows rules applied and AI metadata
  - Added dismissible prop to Dialog component
  - Fixed modal click propagation bug
  - Enhanced devtools UI with modern styling and gradient designs

### Patch Changes

- Updated dependencies
  - @blocksai/ui@0.2.0
