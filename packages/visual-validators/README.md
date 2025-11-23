# @blocksai/visual-validators

Visual validation for Blocks framework using screenshots and AI vision analysis.

## Features

- **Screenshot Capture** - Render HTML and capture screenshots with Playwright
- **Deterministic Validation** - WCAG compliance with axe-core (fast, precise)
- **AI Vision Analysis** - Holistic readability with GPT-4o vision (catches UX issues)
- **Multi-Viewport Testing** - Validate across mobile, tablet, desktop
- **Hybrid Approach** - Combine deterministic and AI-powered validation

## Installation

```bash
pnpm add @blocksai/visual-validators
pnpm add -D playwright

# Install browser
npx playwright install chromium
```

## Quick Start

### Deterministic Validation (axe-core)

```typescript
import { AxeValidator } from '@blocksai/visual-validators';

const axe = new AxeValidator();

const html = `
<!DOCTYPE html>
<html lang="en">
  <body>
    <h1>My Resume</h1>
    <p style="color: #333; background: #fff;">
      This text has good contrast (12.6:1)
    </p>
  </body>
</html>
`;

const result = await axe.validate(html);

console.log(result.valid); // true
console.log(result.issues); // []
```

### AI Vision Validation (GPT-4o)

```typescript
import { VisionValidator } from '@blocksai/visual-validators';
import { AIProvider } from '@blocksai/ai';

const ai = new AIProvider({
  provider: 'openai',
  model: 'gpt-4o-mini' // Cheaper, faster
});

const vision = new VisionValidator(ai);

const result = await vision.validate({
  html,
  blockName: 'theme.modern_professional',
  viewports: [
    { width: 320, height: 568, name: 'mobile' },
    { width: 1024, height: 768, name: 'desktop' }
  ],
  visualRules: [
    'WCAG AA contrast minimum (4.5:1)',
    'Clear visual hierarchy'
  ],
  philosophy: [
    'Resume themes must prioritize readability'
  ]
});

result.issues.forEach(issue => {
  console.log(`[${issue.viewport}] ${issue.message}`);
});
```

## Configuration in blocks.yml

```yaml
ai:
  provider: "openai"
  model: "gpt-4o-mini"

blocks:
  theme.modern_professional:
    test_data: "test-data/sample-resume.json"
    visual_validation:
      viewports:
        - { width: 320, height: 568, name: "mobile" }
        - { width: 768, height: 1024, name: "tablet" }
        - { width: 1024, height: 768, name: "desktop" }
      rules:
        - "Text must be readable on all backgrounds"
        - "WCAG AA contrast minimum (4.5:1)"

validators:
  visual:
    - id: axe_check
      run: "visual.axe.v1"
    - id: vision_check
      run: "visual.vision.v1"
```

## API

### ScreenshotCapture

```typescript
import { ScreenshotCapture } from '@blocksai/visual-validators';

const capture = new ScreenshotCapture();
await capture.initialize();

const screenshots = await capture.captureMultiple(html, [
  { width: 320, height: 568, name: 'mobile' },
  { width: 1024, height: 768, name: 'desktop' }
]);

await capture.close();
```

### AxeValidator

```typescript
const axe = new AxeValidator();
const result = await axe.validate(html);

// result.valid: boolean
// result.issues: VisualIssue[]
```

### VisionValidator

```typescript
const vision = new VisionValidator(ai);

// Multiple viewports
const result = await vision.validate({
  html,
  blockName: 'theme.modern',
  viewports: [...],
  visualRules: [...],
  philosophy: [...]
});

// Single viewport (faster)
const result = await vision.validateSingleViewport({
  html,
  blockName: 'theme.modern',
  viewport: { width: 320, height: 568, name: 'mobile' },
  visualRules: [...],
  philosophy: [...]
});
```

## Types

```typescript
interface Viewport {
  width: number;
  height: number;
  name: string;
}

interface VisualIssue {
  type: 'error' | 'warning';
  code: string;
  message: string;
  suggestion?: string;
  viewport?: string;
}

interface VisualValidationResult {
  valid: boolean;
  issues: VisualIssue[];
}
```

## Cost Considerations

### Models

- **gpt-4o-mini**: ~$0.01 per image (recommended for development)
- **gpt-4o**: ~$0.05 per image (higher quality for production)

### Optimization

- Cache screenshots (only re-validate when templates change)
- Use cheap models for development
- Run visual validation only on changed blocks in CI/CD

## Best Practices

1. **Hybrid Approach**: Combine axe-core (fast, precise) + AI vision (holistic)
2. **Multiple Viewports**: Test mobile, tablet, desktop
3. **Specific Rules**: Write testable visual rules
4. **Cache Aggressively**: Only re-validate on template changes

## Documentation

- [Visual Validation Guide](https://blocksai.dev/docs/validators/visual-validation)
- [Resume Themes Example](https://blocksai.dev/docs/examples/json-resume-themes)
- [AI Configuration](https://blocksai.dev/docs/getting-started/ai-configuration)

## License

MIT
