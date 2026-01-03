# Contributing to Blocks

Thank you for your interest in contributing to Blocks! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/anthropics/blocks.git
cd blocks

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Project Structure

```
blocks/
├── packages/
│   ├── cli/           # @blocksai/cli - Command-line interface
│   ├── schema/        # @blocksai/schema - blocks.yml parser
│   ├── domain/        # @blocksai/domain - Domain modeling
│   ├── validators/    # @blocksai/validators - Validator implementations
│   └── ai/            # @blocksai/ai - AI provider abstraction
├── apps/
│   └── docs/          # Documentation site
├── examples/          # Example projects
└── docs/              # Static documentation
```

## Development Workflow

### Making Changes

1. **Fork the repository** and create a new branch
2. **Make your changes** with clear, focused commits
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Run the test suite** to ensure nothing is broken
6. **Submit a pull request**

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for a specific package
cd packages/cli
pnpm test

# Run tests in watch mode
pnpm test:watch
```

### Building

```bash
# Build all packages
pnpm build

# Build a specific package
cd packages/cli
pnpm build
```

### Type Checking

```bash
# Check types across all packages
pnpm typecheck
```

## Code Style

- Use TypeScript for all code
- Follow existing code patterns in the codebase
- Use meaningful variable and function names
- Write clear comments for complex logic
- Keep functions small and focused

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add new validator for TypeScript files
fix: handle edge case in schema parser
docs: update installation instructions
refactor: simplify domain registry logic
test: add tests for AI provider
```

## Pull Request Process

1. **Update the README.md** if you're adding new features
2. **Add tests** for your changes
3. **Ensure CI passes** (build, tests, type checking)
4. **Request a review** from maintainers
5. **Address feedback** promptly

## Creating Changesets

We use [Changesets](https://github.com/changesets/changesets) for versioning:

```bash
# Create a changeset for your changes
pnpm changeset

# Follow the prompts to describe your changes
```

## Adding a New Validator

1. Create a new file in `packages/validators/src/<type>/`
2. Implement the `Validator` interface
3. Export from the package
4. Register in `ValidatorRegistry`
5. Add tests
6. Update documentation

Example:

```typescript
import { Validator, ValidatorContext, ValidationResult } from '../types';

export class MyValidator implements Validator {
  id = 'my.validator';

  async validate(context: ValidatorContext): Promise<ValidationResult> {
    // Validation logic
    return {
      valid: true,
      issues: []
    };
  }
}
```

## Testing with Examples

The `examples/` directory contains real-world test cases:

```bash
# Test with example projects
cd examples/json-resume-themes
npx @blocksai/cli run theme.modern_professional
```

## Getting Help

- **Questions**: Open a [Discussion](https://github.com/anthropics/blocks/discussions)
- **Bugs**: Open an [Issue](https://github.com/anthropics/blocks/issues)
- **Security**: Email security@anthropic.com

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

For detailed architecture information, see [CLAUDE.md](./CLAUDE.md).
