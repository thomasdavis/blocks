"use client";

import { useState } from "react";
import { Nav } from "../components/nav";
import { CopyButton } from "../copy-button";

// Note: Metadata must be in a separate layout.tsx for client components
// See getting-started/layout.tsx for OG metadata

const agentPrompt = `Set up Blocks validation for this project. Blocks creates a feedback loop between your domain spec and AI agents—it validates code semantically so AI-generated code stays aligned with your requirements.

Docs: https://blocksai.dev

## What to Do

1. Identify repeating modules in this codebase (these are "blocks")
   - Examples: themes, posts, endpoints, components, handlers, templates
   - Anything you have multiples of that should follow consistent rules

2. Create a \`blocks.yml\` file (can live anywhere—validates relative to its location)

3. Define the domain:
   - Philosophy: High-level principles guiding validation
   - Entities: Domain objects with their fields
   - Semantics: Concepts to validate (readability, accessibility, etc.)

4. Configure validators (extensible pipeline):
   - \`schema\` - Type/structure validation
   - \`shape\` - File structure and exports
   - \`domain\` - AI-powered semantic validation
   - Custom validators as needed

5. Define blocks with their inputs/outputs

## blocks.yml Structure

\`\`\`yaml
$schema: "blocks/v2"
name: "Project Name"

philosophy:
  - "Guiding principles for AI validation"
  - "What matters in this domain"

domain:
  entities:
    entity_name:
      fields: [required_field1, required_field2]
      optional: [optional_field]
  semantics:
    quality_metric:
      description: "What this measures"

validators:
  - schema
  - shape
  - name: domain
    config:
      rules:
        - id: rule_id
          description: "What to enforce"

blocks:
  namespace.block_name:
    description: "What this block does"
    path: "relative/path/to/block"
    inputs:
      - name: input_name
        type: entity.entity_name
    outputs:
      - name: output_name
        type: string
\`\`\`

## Workflow

After setup, the feedback loop:
\`\`\`
blocks run --all        # Validate all blocks
blocks run block.name   # Validate specific block
\`\`\`

Fix issues, run again, iterate until pass.

Analyze this codebase and create an appropriate blocks.yml configuration.`;

export default function GettingStartedPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(agentPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050805] text-[#a0b0a0] font-mono">
      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-40 opacity-[0.015]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)",
        }}
      />

      <Nav />

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[#8aca8a] uppercase tracking-wide mb-4">
            Getting Started
          </h1>
          <p className="text-[#6a8a6a] text-lg">
            Create a feedback loop between your domain spec and AI agents.
          </p>
        </div>

        {/* What Blocks Does */}
        <section className="mb-12">
          <div className="bg-[#0a120a] border border-[#3a5a3a] rounded-sm p-6">
            <p className="text-[#8a9a8a]">
              Blocks validates code semantically—AI understands your domain, not just syntax.
              Run <code className="text-[#8aca8a] bg-[#080c08] px-2 py-1 rounded-sm">blocks run</code> during
              development, AI sees issues, fixes code, repeat until pass.
            </p>
          </div>
        </section>

        {/* Installation */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#cadd6a] uppercase tracking-wide mb-4 flex items-center gap-3">
            <span className="text-[#5a8a5a]">01.</span> Install
          </h2>
          <div className="bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4">
            <div className="flex items-center justify-between">
              <code className="text-[#8aca8a]">npm install -g @blocksai/cli</code>
              <CopyButton text="npm install -g @blocksai/cli" />
            </div>
          </div>
        </section>

        {/* Initialize */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#cadd6a] uppercase tracking-wide mb-4 flex items-center gap-3">
            <span className="text-[#5a8a5a]">02.</span> Initialize
          </h2>
          <div className="bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4 mb-4">
            <div className="flex items-center justify-between">
              <code className="text-[#8aca8a]">blocks init</code>
              <CopyButton text="blocks init" />
            </div>
          </div>
          <p className="text-[#6a8a6a] text-sm">
            Creates <code className="text-[#8aca8a] bg-[#0a120a] px-2 py-1 rounded-sm">blocks.yml</code>.
            This file can live anywhere—Blocks validates relative to its location.
          </p>
        </section>

        {/* Run */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#cadd6a] uppercase tracking-wide mb-4 flex items-center gap-3">
            <span className="text-[#5a8a5a]">03.</span> Run
          </h2>
          <div className="space-y-3">
            <div className="bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4">
              <div className="flex items-center justify-between">
                <code className="text-[#8aca8a]">blocks run --all</code>
                <CopyButton text="blocks run --all" />
              </div>
            </div>
            <div className="bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4">
              <div className="flex items-center justify-between">
                <code className="text-[#8aca8a]">blocks run my.block</code>
                <CopyButton text="blocks run my.block" />
              </div>
            </div>
          </div>
        </section>

        {/* AI Agent Prompt */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#cadd6a] uppercase tracking-wide mb-4 flex items-center gap-3">
            <span className="text-[#5a8a5a]">04.</span> AI Setup Prompt
          </h2>
          <p className="text-[#6a8a6a] mb-4">
            Copy this into your AI coding assistant to configure Blocks for your project:
          </p>

          <div className="bg-[#0a120a] border border-[#3a5a3a] rounded-sm overflow-hidden shadow-[0_0_20px_rgba(138,202,138,0.1)]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#080c08] border-b border-[#2a3a2a]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#aa4a4a]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#aa8a4a]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#4aaa4a]"></div>
                <span className="ml-3 text-[#5a8a5a] text-xs uppercase tracking-wider">
                  Prompt for AI Agent
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#0a120a] border border-[#3a5a3a] rounded-sm text-sm text-[#8aca8a] hover:bg-[#1a2a1a] hover:border-[#5a8a5a] transition-all"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-80 overflow-y-auto">
              <pre className="text-sm text-[#8a9a8a] whitespace-pre-wrap font-mono leading-relaxed">
                {agentPrompt}
              </pre>
            </div>
          </div>
        </section>

        {/* Environment */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#cadd6a] uppercase tracking-wide mb-4 flex items-center gap-3">
            <span className="text-[#5a8a5a]">05.</span> Environment
          </h2>
          <p className="text-[#6a8a6a] mb-4">
            Domain validation uses AI. Set your provider's API key:
          </p>
          <div className="space-y-2">
            <div className="bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4">
              <code className="text-[#8aca8a]">OPENAI_API_KEY=...</code>
            </div>
            <div className="bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4">
              <code className="text-[#8aca8a]">ANTHROPIC_API_KEY=...</code>
            </div>
            <div className="bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4">
              <code className="text-[#8aca8a]">GOOGLE_API_KEY=...</code>
            </div>
          </div>
          <p className="text-[#5a8a5a] text-sm mt-3">
            Blocks is LLM agnostic—works with any provider.
          </p>
        </section>

        {/* What's Next */}
        <section>
          <h2 className="text-xl font-bold text-[#cadd6a] uppercase tracking-wide mb-4 flex items-center gap-3">
            <span className="text-[#5a8a5a]">06.</span> Next
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="/architecture"
              className="block bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4 hover:border-[#3a5a3a] transition-colors"
            >
              <h3 className="text-[#8aca8a] font-semibold mb-1">Architecture</h3>
              <p className="text-[#6a8a6a] text-sm">How Blocks validates source code.</p>
            </a>
            <a
              href="/docs"
              className="block bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4 hover:border-[#3a5a3a] transition-colors"
            >
              <h3 className="text-[#8aca8a] font-semibold mb-1">Docs</h3>
              <p className="text-[#6a8a6a] text-sm">Configuration and validators.</p>
            </a>
            <a
              href="/docs/examples"
              className="block bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4 hover:border-[#3a5a3a] transition-colors"
            >
              <h3 className="text-[#8aca8a] font-semibold mb-1">Examples</h3>
              <p className="text-[#6a8a6a] text-sm">Real configurations in action.</p>
            </a>
            <a
              href="https://github.com/thomasdavis/blocks"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4 hover:border-[#3a5a3a] transition-colors"
            >
              <h3 className="text-[#8aca8a] font-semibold mb-1">GitHub</h3>
              <p className="text-[#6a8a6a] text-sm">Source and issues.</p>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <div className="border-t border-[#2a3a2a] bg-[#080c08] py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[#5a8a5a] text-sm">
            <div className="w-2 h-2 rounded-full bg-[#5a8a5a] animate-pulse" />
            <span className="uppercase tracking-wider">Blocks</span>
          </div>
        </div>
      </div>
    </div>
  );
}
