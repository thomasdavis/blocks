# Blocks - Social Media Launch Content

## Product Hunt

### Tagline (60 chars max)
```
AI-powered semantic validation for your codebase
```

### Description (260 chars)
```
Blocks teaches AI coding assistants your domain rules. Define entities, semantics, and philosophy in YAML. Get AI-powered validation at development time. Works with Claude, GPT, Gemini. Open source (MIT).
```

### Maker's Comment
```
Hey Product Hunt!

I built Blocks because AI coding assistants are amazing at writing code fast, but they don't understand your domain rules. They'll generate a resume template that looks right but uses <div> instead of semantic HTML, or miss accessibility requirements you care about.

Blocks solves this by validating source code at development time—before it ever runs. You define your domain (entities, semantics, philosophy) in a simple YAML file, and Blocks uses AI to check that your code actually follows those rules.

Key features:
- Works with OpenAI, Anthropic, and Google AI
- Three validation layers: Schema -> Shape -> Domain
- Philosophy-driven validation (your principles, enforced by AI)
- Reads ALL your source files for complete context
- Graceful degradation when AI is unavailable

It's completely open source (MIT) and works with any project structure.

Try it: npx @blocksai/cli init

Would love your feedback! What domain rules would you want to enforce?
```

### First Comment
```
Some backstory: I was using Claude to generate resume themes and noticed it kept making the same mistakes—inline styles, non-semantic HTML, missing ARIA labels. I'd fix them, but the next generation would have the same issues.

I realized the AI needed to understand my *domain*, not just my code. That's what Blocks does—it teaches AI your rules at development time, so you catch issues before they become bugs.

Happy to answer any questions!
```

---

## Twitter/X Thread

### Tweet 1 (Announcement)
```
Introducing Blocks - AI-powered semantic validation for your codebase

Teach AI coding assistants your domain rules. Catch issues at development time, not runtime.

Open source (MIT). Works with GPT, Claude, and Gemini.

npx @blocksai/cli init

🧵 Thread...
```

### Tweet 2 (Problem)
```
The problem:

AI coding tools write code fast, but they don't know your domain:
- What makes HTML "semantic"?
- Which fields are required in your Resume type?
- What does "accessible" mean for your app?

Each generation drifts further from your standards.
```

### Tweet 3 (Solution)
```
The solution:

Define your domain once in blocks.yml:
- Entities (your data structures)
- Semantics (qualitative rules)
- Philosophy (guiding principles)

Blocks uses AI to validate your source code follows these rules.

Development-time validation. Zero runtime overhead.
```

### Tweet 4 (Demo)
```
How it works:

1. blocks init → creates blocks.yml
2. Define your domain and blocks
3. blocks run → AI validates your code
4. Get actionable feedback

Three layers:
Schema (fast) → Shape (fast) → Domain (AI)
```

### Tweet 5 (Features)
```
Features:

✅ Multi-provider: OpenAI, Anthropic, Google
✅ Philosophy-driven: Your principles, enforced
✅ Reads ALL files: Complete context for AI
✅ Graceful fallbacks: Works when AI is down
✅ Zero config: Sensible defaults
✅ TypeScript: Full type safety
```

### Tweet 6 (Use Cases)
```
Use cases:

📝 Resume themes - Enforce semantic HTML
📰 Blog content - SEO and readability
🧩 Component libs - Accessibility rules
🔌 APIs - Schema compliance

What would you validate?
```

### Tweet 7 (CTA)
```
Get started:

npm install -g @blocksai/cli
blocks init

Or try without installing:

npx @blocksai/cli init

GitHub: github.com/anthropics/blocks
Docs: [docs-url]

Star ⭐ if you find it useful!
```

---

## LinkedIn Post

```
Excited to share Blocks — an open-source framework for AI-powered code validation.

The Problem:
AI coding assistants (Claude, Cursor, Copilot) write code fast, but they don't understand your domain rules. Each generation drifts from your standards, and you catch issues at runtime instead of development time.

The Solution:
Blocks lets you define your domain in YAML—entities, semantics, philosophy—and validates your source code at development time using AI. Think of it as a type system for your domain logic.

Key Features:
• Works with OpenAI, Anthropic, and Google AI
• Three validation layers: Schema → Shape → Domain
• Philosophy-driven (your principles, enforced by AI)
• Zero runtime overhead
• Open source (MIT license)

Try it:
npx @blocksai/cli init

GitHub: github.com/anthropics/blocks

Would love to hear what domain rules you'd want to enforce in your projects!

#OpenSource #AI #DeveloperTools #TypeScript #CodeQuality
```

---

## Hacker News

### Title
```
Show HN: Blocks – AI-powered semantic validation for codebases
```

### Post
```
Hey HN,

I built Blocks to solve a problem I kept running into with AI coding tools: they write code fast, but they don't understand domain rules.

For example, when generating resume themes, Claude would use <div> tags instead of semantic HTML, miss ARIA labels, and ignore accessibility requirements—even when I asked for them. Fixing these manually works, but the next generation has the same issues.

Blocks lets you define your domain (entities, semantics, philosophy) in a YAML file, then validates your source code at development time using AI. It's like a linter that understands "what makes HTML semantic" or "what does accessible mean for my app."

Three validation layers:
1. Schema (fast) - Config structure checks
2. Shape (fast) - File structure validation
3. Domain (AI) - Semantic compliance

Works with OpenAI, Anthropic (Claude), and Google (Gemini).

Try it: npx @blocksai/cli init

GitHub: https://github.com/anthropics/blocks

The core insight: templates are deterministic (same input → same output), so if source code passes validation during development, it will always produce correct output at runtime. No need for runtime checks.

Open to feedback on the approach. What domain rules would you want to enforce?
```

---

## Key Messages

### One-liner
```
AI-powered semantic validation for your codebase
```

### Elevator pitch (30 seconds)
```
Blocks is a development-time validator that teaches AI coding assistants your domain rules. You define entities, semantics, and philosophy in YAML, and Blocks uses AI to validate your source code follows those rules—before runtime. It works with GPT, Claude, and Gemini, and it's completely open source.
```

### Key benefits
1. **Consistency** - Every AI generation follows your domain rules
2. **Speed** - Catch issues at development time, not runtime
3. **Flexibility** - Works with any AI provider, any project structure
4. **Simplicity** - One YAML file defines everything

### Differentiators
1. **Development-time, not runtime** - Zero overhead in production
2. **AI-powered semantics** - Understands "what" not just "how"
3. **Philosophy-driven** - Your principles, enforced automatically
4. **Multi-provider** - OpenAI, Anthropic, Google
