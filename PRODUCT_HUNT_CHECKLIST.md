# Blocks - Product Hunt Launch Checklist

## Current State Summary

| Category | Status | Priority |
|----------|--------|----------|
| Core Product | ✅ Ready | - |
| npm Packages | ✅ Published | - |
| Documentation | ✅ Excellent | - |
| Examples | ✅ Production-quality | - |
| Branding | ✅ Complete | - |
| Landing Page | ✅ Complete | - |
| Package READMEs | ✅ Complete | - |
| GitHub Templates | ✅ Complete | - |
| Social Content | ✅ Complete | - |
| Social Proof | ⚠️ Pending | Medium |
| Demo Video | ⚠️ Optional | Low |

---

## Pre-Launch: Product Readiness

### Code & Packages ✅ DONE

- [x] All 5 core packages published to npm
  - @blocksai/cli (0.3.0)
  - @blocksai/schema (1.1.0)
  - @blocksai/domain (0.3.0)
  - @blocksai/validators (1.2.0)
  - @blocksai/ai (3.0.2)
- [x] CLI works via `npx @blocksai/cli`
- [x] `blocks init` creates valid blocks.yml
- [x] `blocks run` validates blocks correctly
- [x] `blocks run --all` validates all blocks
- [x] All three AI providers working (OpenAI, Anthropic, Google)
- [x] Graceful error handling for AI failures
- [x] v2.0 specification implemented

### Documentation ✅ DONE

- [x] Root README with problem/solution framing
- [x] Getting started guide
- [x] Real-world examples in README
- [x] Configuration reference
- [x] FAQ section (10+ questions)
- [x] Architecture explanation
- [x] Roadmap section
- [x] Contributing guide (CLAUDE.md)

### Examples ✅ DONE

- [x] json-resume-themes - Template rendering pattern
- [x] blog-content-validator - Content validation pattern
- [x] hr-recommendation - AI adapter pattern
- [x] All examples have README.md
- [x] All examples have working blocks.yml
- [x] All examples have test data

---

## Pre-Launch: Marketing Assets

### Branding ✅ COMPLETE

- [x] **Logo**: Created with OpenAI image generation
  - Primary logo: `assets/logo.png`
  - OG image: `assets/og-image.png` (1536x1024)
  - GitHub social: `assets/github-social.png` (1536x1024)
- [x] Add logo to root README
- [x] Add logo to docs site
- [x] Add OG image metadata to docs site

### Landing Page ✅ COMPLETE (apps/docs)

- [x] **Hero section** with logo, tagline, CTA
- [x] **Quick start** code snippet
- [x] **How it works** - The validation loop
- [x] **Multi-layer validation** - Schema, Shape, Domain
- [x] **Live examples** - 3 real-world examples
- [x] **CTA section** with Get Started + GitHub links
- [x] **OG image** for social sharing

### Demo Video (TODO - High Priority)

- [ ] **30-second GIF** for Product Hunt thumbnail
  - Show terminal running `blocks init`
  - Show blocks.yml being created
  - Show `blocks run` with colorful output
  - Show validation passing ✅
- [ ] **2-minute walkthrough video**
  - Problem intro (15 sec)
  - Install & init (30 sec)
  - Create a block (30 sec)
  - Run validation (30 sec)
  - AI feedback demo (15 sec)
- [ ] Upload to YouTube (unlisted or public)
- [ ] Create thumbnail image

### Screenshots (TODO - Medium Priority)

- [ ] Terminal output of `blocks run` (success)
- [ ] Terminal output with validation errors
- [ ] blocks.yml syntax highlighted
- [ ] Docs site homepage
- [ ] Example project structure

---

## Pre-Launch: Platform Prep

### Product Hunt Listing

- [ ] **Name**: Blocks
- [ ] **Tagline** (60 chars max): "AI-powered semantic validation for your codebase"
- [ ] **Description** (260 chars):
  > Blocks teaches AI coding assistants your domain rules. Define entities, semantics, and philosophy in YAML. Get AI-powered validation at development time. Works with Claude, GPT, Gemini. Open source (MIT).
- [ ] **Topics**: Developer Tools, Open Source, AI, Productivity
- [ ] **Thumbnail**: Logo or demo GIF (240x240)
- [ ] **Gallery images** (5-8 images):
  1. Terminal demo GIF
  2. blocks.yml example
  3. Validation output
  4. Architecture diagram
  5. Use case examples
- [ ] **Maker comment** prepared
- [ ] **First comment** drafted (add context, thank supporters)

### GitHub Repo Polish ✅ COMPLETE

- [x] Add badges to README
  - npm version
  - License (MIT)
  - Build status
  - Downloads count
- [ ] Pin important issues/discussions
- [ ] Add "good first issue" labels
- [ ] Create CONTRIBUTING.md (or link to CLAUDE.md)
- [ ] Add issue templates
- [ ] Add PR template
- [ ] Enable Discussions tab
- [ ] Add social preview image (1280x640)

### Package READMEs ✅ COMPLETE

- [x] `packages/cli/README.md` - Commands, configuration, examples
- [x] `packages/schema/README.md` - Parser API, schema reference
- [x] `packages/domain/README.md` - Registry & analyzer APIs
- [x] `packages/validators/README.md` - Built-in validators, custom guide
- [x] `packages/ai/README.md` - Multi-provider setup, API reference

---

## Pre-Launch: Social & Community

### Social Media Prep

- [ ] **Twitter/X thread** drafted (5-7 tweets)
  - Tweet 1: Announcement + link
  - Tweet 2: Problem statement
  - Tweet 3: Solution (with GIF)
  - Tweet 4: Key features
  - Tweet 5: Use cases
  - Tweet 6: Call to action
- [ ] **LinkedIn post** drafted
- [ ] **Dev.to article** drafted (optional)
- [ ] **Hacker News** post prepared (optional)

### Community Outreach

- [ ] List of relevant communities to share:
  - r/programming
  - r/typescript
  - r/webdev
  - Discord servers (Vercel, AI SDK, etc.)
  - Slack communities
- [ ] Identify 10-20 developers who might be interested
- [ ] Prepare personalized messages for key influencers

### Launch Day Support

- [ ] Team availability scheduled for launch day
- [ ] Response templates for common questions:
  - "How is this different from ESLint?"
  - "Does this work with [framework]?"
  - "What AI providers are supported?"
  - "Is this free?"
  - "How do I contribute?"

---

## Launch Day Checklist

### Morning (Before Launch)

- [ ] Final test of `npx @blocksai/cli init`
- [ ] Verify all example projects work
- [ ] Check docs site is live
- [ ] Prepare Product Hunt posting account
- [ ] Have team on standby

### Launch (Go Live)

- [ ] Submit to Product Hunt
- [ ] Post maker's comment immediately
- [ ] Share on Twitter/X
- [ ] Share on LinkedIn
- [ ] Post to relevant communities
- [ ] Email personal network (if applicable)

### Throughout the Day

- [ ] Respond to all Product Hunt comments within 1 hour
- [ ] Respond to GitHub issues/stars
- [ ] Share milestone updates on social
- [ ] Thank early supporters personally
- [ ] Monitor for bugs/issues

### End of Day

- [ ] Thank everyone on Product Hunt
- [ ] Summary post on social media
- [ ] Note down feedback themes
- [ ] Celebrate! 🎉

---

## Post-Launch

### Week 1

- [ ] Follow up with commenters who had questions
- [ ] Create GitHub issues for feature requests
- [ ] Write "launch retrospective" blog post (optional)
- [ ] Update README with any clarifications needed
- [ ] Fix any bugs reported during launch

### Ongoing

- [ ] Continue engaging with community
- [ ] Ship quick wins from feedback
- [ ] Build roadmap based on requests
- [ ] Consider ProductHunt "Launch" badge for README

---

## Product Hunt Copy (Ready to Use)

### Tagline Options (pick one)

1. "AI-powered semantic validation for your codebase" (45 chars)
2. "Teach AI agents your domain rules" (35 chars)
3. "Development-time validation with AI guardrails" (47 chars)
4. "The semantic validator for AI-generated code" (45 chars)

### Description (260 chars)

> Blocks is a development-time validation framework that uses AI to ensure your code follows domain semantics. Define entities, rules, and philosophy in YAML. Get instant feedback from GPT-4, Claude, or Gemini. Open source, MIT licensed.

### Maker's Comment (Draft)

> Hey Product Hunt! 👋
>
> I built Blocks because AI coding assistants are amazing at writing code fast, but they don't understand your domain rules. They'll generate a resume template that looks right but uses `<div>` instead of semantic HTML, or miss accessibility requirements you care about.
>
> Blocks solves this by validating source code at development time—before it ever runs. You define your domain (entities, semantics, philosophy) in a simple YAML file, and Blocks uses AI to check that your code actually follows those rules.
>
> **Key features:**
> - Works with OpenAI, Anthropic, and Google AI
> - Three validation layers: Schema → Shape → Domain
> - Philosophy-driven validation (your principles, enforced by AI)
> - Reads ALL your source files for complete context
> - Graceful degradation when AI is unavailable
>
> It's completely open source (MIT) and works with any project structure.
>
> Try it: `npx @blocksai/cli init`
>
> Would love your feedback! What domain rules would you want to enforce?

### First Comment (Draft)

> Some backstory: I was using Claude to generate resume themes and noticed it kept making the same mistakes—inline styles, non-semantic HTML, missing ARIA labels. I'd fix them, but the next generation would have the same issues.
>
> I realized the AI needed to understand my *domain*, not just my code. That's what Blocks does—it teaches AI your rules at development time, so you catch issues before they become bugs.
>
> Happy to answer any questions! 🙏

---

## Quick Reference: Key Links

| Resource | URL |
|----------|-----|
| npm CLI | https://www.npmjs.com/package/@blocksai/cli |
| GitHub | https://github.com/[org]/blocks |
| Docs | [docs URL] |
| Examples | /examples in repo |

---

## Estimated Timeline

| Task | Time | Owner |
|------|------|-------|
| Logo & branding | 2-4 hours | Design |
| Landing page | 4-8 hours | Dev |
| Demo video | 2-3 hours | Marketing |
| Package READMEs | 2 hours | Dev |
| Social content | 2 hours | Marketing |
| GitHub polish | 1 hour | Dev |
| **Total** | **~15-20 hours** | |

---

## Success Metrics

### Launch Day Goals

- [ ] Top 10 on Product Hunt (target: Top 5)
- [ ] 100+ upvotes
- [ ] 50+ GitHub stars
- [ ] 10+ meaningful comments
- [ ] 0 critical bugs reported

### Week 1 Goals

- [ ] 500+ npm downloads
- [ ] 200+ GitHub stars
- [ ] 5+ GitHub issues (feature requests)
- [ ] 1+ blog posts/tweets from users
- [ ] 3+ new contributors

---

**Bottom Line**: The product is ready. Focus the next 2-3 days on:
1. Logo/branding
2. Demo GIF/video
3. Landing page (or enhanced docs homepage)
4. Social content prep

Then launch! 🚀
