import type { PageContent, PageType } from './types';

const DESIGN_SYSTEM = `
Design System:
- Background: Deep dark green-black (#050805 to #0a120a gradient)
- Primary accent: Bright terminal green (#8aca8a)
- Secondary accent: Yellow-green (#cadd6a)
- Muted green: (#5a8a5a)
- Border color: (#2a3a2a to #3a5a3a)
- Style: Terminal/CLI aesthetic, monospace typography, grid patterns
- Effects: Subtle scanlines, CRT glow, matrix-style ambiance
- Typography: Monospace font (JetBrains Mono style), uppercase headers
- Size: 1536x1024 pixels
- NO text other than specified title/tagline
`;

const PAGE_CONCEPTS: Record<PageType, string> = {
  home: `
Create a hero image for "Blocks" - an AI code validation framework.
Visual concept:
- Central terminal window with green glow
- Code blocks floating around it with validation checkmarks
- Circuit-board style connection lines between blocks
- "BLOCKS" title in large monospace font with green glow
- Tagline: "Spec → Validate → Ship"
- Subtle grid pattern in background
`,

  'getting-started': `
Create an onboarding/getting started image.
Visual concept:
- Terminal window showing "blocks init" command
- Steps flowing downward: Install → Configure → Validate
- Rocket or arrow indicating quick start
- "GET STARTED" title
- Clean, welcoming but technical aesthetic
`,

  architecture: `
Create a technical architecture diagram image.
Visual concept:
- Nested boxes showing package hierarchy (cli → validators → domain → schema)
- Arrows showing data flow
- Pipeline visualization: blocks.yml → validators → results
- "ARCHITECTURE" title
- Blueprint/schematic aesthetic with green lines on dark background
`,

  docs: `
Create a documentation image.
Visual concept:
- Open book or document icon made of terminal characters
- Code snippets floating around
- "DOCUMENTATION" title
- Organized, structured feel with grid layout
`,

  changelog: `
Create a changelog/updates image.
Visual concept:
- Timeline or version history visualization
- Git commit style nodes connected by lines
- "CHANGELOG" title
- Version numbers floating (v1, v2, etc.)
`,

  devtools: `
Create a developer tools image.
Visual concept:
- Browser devtools panel aesthetic
- Inspection/debugging visualization
- Console output with green text
- "DEVTOOLS" title
`,

  examples: `
Create an examples/showcase image.
Visual concept:
- Multiple small terminal windows showing different use cases
- Code examples with syntax highlighting (green theme)
- "EXAMPLES" title
- Gallery/showcase layout
`,
};

export function buildPrompt(content: PageContent): string {
  const concept = PAGE_CONCEPTS[content.pageType] || PAGE_CONCEPTS.home;

  return `
Generate a professional Open Graph image for a developer tool website.

${concept}

Page Title: "${content.title}"
Page Description: "${content.description}"

${DESIGN_SYSTEM}

Important:
- Make it visually striking and memorable
- Keep the terminal/CLI aesthetic consistent
- Use the green color palette exclusively
- Professional quality suitable for social media sharing
- Dark theme only - no light backgrounds
`.trim();
}
