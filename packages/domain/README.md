# @blocksai/domain

Domain modeling and semantic validation engine for the Blocks framework.

[![npm version](https://img.shields.io/npm/v/@blocksai/domain.svg)](https://www.npmjs.com/package/@blocksai/domain)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @blocksai/domain
```

## Usage

### DomainRegistry

The `DomainRegistry` provides access to domain configuration from your `blocks.yml`:

```typescript
import { DomainRegistry } from '@blocksai/domain';
import { parseBlocksConfig } from '@blocksai/schema';

const config = parseBlocksConfig(yamlContent);
const registry = new DomainRegistry(config);

// Get all entities
const entities = registry.getEntities();

// Get all semantics
const semantics = registry.getSemantics();

// Get a specific block
const block = registry.getBlock('theme.modern');

// Get domain rules for a block
const rules = registry.getBlockDomainRules('theme.modern');

// Get project philosophy
const philosophy = registry.getPhilosophy();
```

### DomainAnalyzer

The `DomainAnalyzer` performs static analysis on blocks:

```typescript
import { DomainAnalyzer } from '@blocksai/domain';

const analyzer = new DomainAnalyzer(registry);

// Analyze a specific block
const result = analyzer.analyzeBlock('theme.modern');

// Detect drift across all blocks
const driftReport = analyzer.detectDrift();
```

## API

### DomainRegistry

| Method | Description |
|--------|-------------|
| `getEntities()` | Get all domain entities |
| `getSemantics()` | Get all domain semantics |
| `getBlock(name)` | Get a specific block definition |
| `getDomainRules()` | Get global domain rules |
| `getBlockDomainRules(name)` | Get merged rules for a block |
| `getPhilosophy()` | Get project philosophy statements |
| `shouldSkipValidator(block, validator)` | Check if validator should be skipped |
| `getBlockExcludePatterns(name)` | Get file exclusion patterns |

### DomainAnalyzer

| Method | Description |
|--------|-------------|
| `analyzeBlock(name)` | Static analysis of a single block |
| `detectDrift()` | Detect domain drift across blocks |

## Concepts

### Entities

Entities are the core data structures in your domain:

```yaml
domain:
  entities:
    user:
      fields: [id, name, email]
      optional: [avatar]
```

### Semantics

Semantics define qualitative concepts:

```yaml
domain:
  semantics:
    readability:
      description: "Text should be easy to understand"
      extraction_hint: "Look for short sentences"
```

### Domain Rules

Rules define specific requirements:

```yaml
validators:
  - name: domain
    config:
      rules:
        - id: semantic_html
          description: "Use semantic HTML elements"
```

## Related Packages

- [@blocksai/schema](https://www.npmjs.com/package/@blocksai/schema) - Configuration parser
- [@blocksai/validators](https://www.npmjs.com/package/@blocksai/validators) - Validator implementations
- [@blocksai/ai](https://www.npmjs.com/package/@blocksai/ai) - AI provider abstraction

## License

MIT
