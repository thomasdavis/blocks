---
"@blocksai/devtools": minor
---

feat: Enhanced devtools UI with full validation visibility

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
