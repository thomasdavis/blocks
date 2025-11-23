# Publishing Guide

This repository uses [Changesets](https://github.com/changesets/changesets) for automated package versioning and publishing to NPM.

## Fully Automated Publishing (Recommended)

The publishing workflow is **completely automated**:

1. **Create a changeset** when you make changes:
   ```bash
   pnpm changeset
   ```
   Follow the prompts to select packages and version bump type (major/minor/patch).

2. **Commit and push** your changeset file along with your code changes:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push
   ```

3. **Automatic process:**
   - GitHub Actions creates a "Version Packages" PR
   - The PR is **automatically merged** when CI passes
   - Packages are **automatically published** to NPM
   - GitHub releases are **automatically created**

That's it! No manual intervention needed.

## Manual Publishing

If you need to publish manually for any reason:

### Option 1: Via GitHub Actions UI

1. Go to the **Actions** tab in GitHub
2. Select the **Release** workflow
3. Click **Run workflow**
4. Choose whether to skip the version PR (publishes immediately)

### Option 2: Via Command Line

```bash
# Make sure you have NPM_TOKEN set
export NPM_TOKEN=your_token_here

# Run the manual publish script
pnpm run publish:manual
```

This will:
1. Build all packages
2. Version packages based on changesets
3. Publish to NPM

## Useful Commands

```bash
# Create a new changeset
pnpm changeset

# Add a changeset interactively
pnpm changeset:add

# Check changeset status
pnpm changeset:status

# Version packages locally (for testing)
pnpm version-packages

# Build all packages
pnpm build

# Build only publishable packages
turbo run build --filter=./packages/*

# Publish manually (requires NPM_TOKEN)
pnpm run publish:manual
```

## How It Works

### Changesets Workflow

1. **Changeset files** (`.changeset/*.md`) describe what changed and which packages need version bumps
2. **Version PR** updates package.json versions and generates CHANGELOG.md files
3. **Publishing** happens when version PR is merged to main

### Auto-merge Behavior

The workflow uses GitHub's auto-merge feature:
- Version PR is created with auto-merge enabled
- PR merges automatically once CI checks pass
- Publishing happens immediately after merge

### Independent Versioning

Each package is versioned independently:
- `@blocksai/schema` - Core schema and parser
- `@blocksai/domain` - Domain registry and utilities
- `@blocksai/validators` - Validation framework
- `@blocksai/ai` - AI provider integration
- `@blocksai/cli` - Command-line interface

Packages only get version bumps when they have changes.

## Configuration

### Changeset Config

Located in `.changeset/config.json`:

```json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "linked": [],
  "fixed": []
}
```

### GitHub Workflow

Located in `.github/workflows/release.yml`:

- Triggers on push to `main`
- Also supports manual workflow dispatch
- Auto-merges version PRs
- Creates GitHub releases
- Publishes to NPM with provenance

## NPM Token Setup

The `NPM_TOKEN` secret must be configured in GitHub:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add a secret named `NPM_TOKEN`
3. Value should be an NPM automation token with publish access

Generate token at: https://www.npmjs.com/settings/YOUR_USERNAME/tokens

## Troubleshooting

### Version PR not auto-merging

Check:
- CI checks are passing
- Auto-merge is enabled on the repository
- Branch protection rules allow auto-merge

### Publishing fails

Check:
- NPM_TOKEN is valid and has publish access
- Package names are available on NPM (scoped to @blocksai)
- All packages have `publishConfig.access: "public"`

### No version PR created

Check:
- Changeset files exist in `.changeset/`
- Run `pnpm changeset:status` to see pending changes
- Verify GitHub Actions workflow is enabled

## Examples

### Example: Adding a new feature

```bash
# Make your changes
vim packages/schema/src/types.ts

# Create a changeset
pnpm changeset
# Select: @blocksai/schema
# Select: minor (new feature)
# Description: "Add support for custom validators"

# Commit and push
git add .
git commit -m "feat: add custom validator support"
git push

# Done! Publishing happens automatically
```

### Example: Fixing a bug

```bash
# Fix the bug
vim packages/cli/src/commands/run.ts

# Create a changeset
pnpm changeset
# Select: @blocksai/cli
# Select: patch (bug fix)
# Description: "Fix --all flag filtering"

# Commit and push
git add .
git commit -m "fix: filter domain_rules from --all"
git push

# Done! Publishing happens automatically
```

### Example: Multiple packages

```bash
# Make changes to multiple packages
vim packages/schema/src/types.ts
vim packages/domain/src/registry.ts
vim packages/validators/src/domain/domain-validator.ts

# Create a changeset
pnpm changeset
# Select: @blocksai/schema (minor)
# Select: @blocksai/domain (minor)
# Select: @blocksai/validators (patch)
# Description: "Add blocks.domain_rules for DRY validation"

# Commit and push
git add .
git commit -m "feat: add default domain rules"
git push

# Done! All three packages will be versioned and published
```

## Current Changesets

Check `.changeset/` directory for pending changesets:

```bash
ls -la .changeset/
```

Current pending changes:
- `domain-rules-feature.md` - Adds blocks.domain_rules feature
