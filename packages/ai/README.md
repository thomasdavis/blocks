# @blocksai/ai

Multi-provider AI abstraction for semantic validation in the Blocks framework.

[![npm version](https://img.shields.io/npm/v/@blocksai/ai.svg)](https://www.npmjs.com/package/@blocksai/ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @blocksai/ai
```

## Supported Providers

| Provider | Models |
|----------|--------|
| OpenAI | `gpt-4o-mini`, `gpt-4o` |
| Anthropic | `claude-3-5-sonnet-latest`, `claude-3-5-haiku-latest` |
| Google | `gemini-1.5-flash`, `gemini-1.5-pro` |

## Usage

### Basic Setup

```typescript
import { AIProvider } from '@blocksai/ai';

const ai = new AIProvider({
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-latest'
});
```

### Structured Output

```typescript
import { z } from 'zod';

const ResultSchema = z.object({
  valid: z.boolean(),
  issues: z.array(z.object({
    message: z.string(),
    severity: z.enum(['error', 'warning'])
  }))
});

const result = await ai.generateStructured(
  'Analyze this code for issues...',
  ResultSchema
);
```

### Domain Semantic Validation

```typescript
const result = await ai.validateDomainSemantics({
  files: {
    'block.ts': '...',
    'template.hbs': '...'
  },
  philosophy: ['Use semantic HTML', 'Accessibility first'],
  domainRules: [
    { id: 'a11y', description: 'Must include ARIA labels' }
  ],
  entities: { user: { fields: ['name', 'email'] } },
  semantics: { readability: { description: '...' } }
});
```

### Text Generation

```typescript
const text = await ai.generateText('Explain this code...');
```

### Utility Methods

```typescript
// Detect language of text
const lang = await ai.detectLanguage('Bonjour le monde');

// Score content quality
const score = await ai.scoreQuality(content, 'readability');
```

## API

### `AIProvider`

```typescript
class AIProvider {
  constructor(config?: AIConfig);

  generateStructured<T>(prompt: string, schema: ZodSchema<T>): Promise<T>;
  generateText(prompt: string): Promise<string>;
  validateDomainSemantics(context: DomainContext): Promise<ValidationResult>;
  detectLanguage(text: string): Promise<string>;
  scoreQuality(text: string, criteria: string): Promise<number>;
}
```

### Configuration

```typescript
interface AIConfig {
  provider?: 'openai' | 'anthropic' | 'google';
  model?: string;
  on_failure?: 'warn' | 'error' | 'skip';
}
```

## Environment Variables

The provider automatically reads API keys from environment variables:

```bash
# OpenAI
export OPENAI_API_KEY=sk-...

# Anthropic
export ANTHROPIC_API_KEY=sk-ant-...

# Google
export GOOGLE_GENERATIVE_AI_API_KEY=...
```

## Configuration in blocks.yml

```yaml
ai:
  provider: anthropic
  model: claude-3-5-sonnet-latest
  on_failure: warn  # warn | error | skip
```

## Error Handling

The provider handles AI failures gracefully:

```typescript
try {
  const result = await ai.validateDomainSemantics(context);
} catch (error) {
  // Falls back to warning by default
  // unless on_failure: 'error' is set
}
```

## Dependencies

Built on [Vercel AI SDK](https://sdk.vercel.ai/) v6:

- `@ai-sdk/openai`
- `@ai-sdk/anthropic`
- `@ai-sdk/google`
- `ai`

## Related Packages

- [@blocksai/cli](https://www.npmjs.com/package/@blocksai/cli) - Command-line interface
- [@blocksai/validators](https://www.npmjs.com/package/@blocksai/validators) - Validator implementations
- [@blocksai/domain](https://www.npmjs.com/package/@blocksai/domain) - Domain modeling
- [@blocksai/schema](https://www.npmjs.com/package/@blocksai/schema) - Configuration parser

## License

MIT
