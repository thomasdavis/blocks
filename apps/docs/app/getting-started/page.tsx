"use client";

import { useState } from "react";
import { Nav } from "../components/nav";
import { CopyButton } from "../copy-button";

const agentPrompt = `I want to set up Blocks validation for this project. Blocks is a framework that validates source code at development time using AI-powered semantic analysis.

## What I Need

1. Create a \`blocks.yml\` configuration file at the project root
2. Define the domain concepts (entities and semantics) relevant to this codebase
3. Set up validation rules that enforce our coding standards
4. Create block definitions for the key modules/components

## blocks.yml Structure

\`\`\`yaml
$schema: "blocks/v2"
name: "Project Name"

philosophy:
  - "High-level principles that guide code quality"
  - "Domain-specific rules AI should enforce"

domain:
  entities:
    entity_name:
      fields: [field1, field2]
      optional: [optional_field]
  semantics:
    semantic_name:
      description: "What this semantic concept means"

validators:
  - schema
  - shape
  - name: domain
    config:
      rules:
        - id: rule_id
          description: "What the rule enforces"

blocks:
  namespace.block_name:
    description: "What this block does"
    path: "path/to/block"
    inputs:
      - name: input_name
        type: entity.entity_name
    outputs:
      - name: output_name
        type: string
\`\`\`

## Key Concepts

- **Philosophy**: High-level principles the AI validator uses to evaluate code semantics
- **Entities**: Domain objects with required and optional fields
- **Semantics**: Named concepts the AI can extract/validate (like "readability" or "humor_score")
- **Validators**: Pipeline of checks (schema validates types, shape validates structure, domain uses AI)
- **Blocks**: Individual modules/components with defined inputs/outputs

## Steps

1. Analyze the codebase to understand the domain
2. Identify key entities and their fields
3. Define semantic concepts that matter for code quality
4. Create validation rules based on coding standards
5. Define blocks for the main modules

After setup, I can run \`blocks run --all\` to validate all blocks, or \`blocks run block.name\` for a specific block.

Please analyze this codebase and create an appropriate blocks.yml configuration.`;

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
            Set up Blocks validation in your project in minutes.
          </p>
        </div>

        {/* Installation */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#cadd6a] uppercase tracking-wide mb-4 flex items-center gap-3">
            <span className="text-[#5a8a5a]">01.</span> Install the CLI
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
            <span className="text-[#5a8a5a]">02.</span> Initialize Configuration
          </h2>
          <div className="bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4 mb-4">
            <div className="flex items-center justify-between">
              <code className="text-[#8aca8a]">blocks init</code>
              <CopyButton text="blocks init" />
            </div>
          </div>
          <p className="text-[#6a8a6a] text-sm">
            This creates a <code className="text-[#8aca8a] bg-[#0a120a] px-2 py-1 rounded-sm">blocks.yml</code> file in your project root.
          </p>
        </section>

        {/* Run Validation */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#cadd6a] uppercase tracking-wide mb-4 flex items-center gap-3">
            <span className="text-[#5a8a5a]">03.</span> Run Validation
          </h2>
          <div className="space-y-3">
            <div className="bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <code className="text-[#8aca8a]">blocks run --all</code>
                  <span className="text-[#5a8a5a] ml-4 text-sm"># Validate all blocks</span>
                </div>
                <CopyButton text="blocks run --all" />
              </div>
            </div>
            <div className="bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <code className="text-[#8aca8a]">blocks run my.block</code>
                  <span className="text-[#5a8a5a] ml-4 text-sm"># Validate specific block</span>
                </div>
                <CopyButton text="blocks run my.block" />
              </div>
            </div>
          </div>
        </section>

        {/* AI Agent Prompt */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#cadd6a] uppercase tracking-wide mb-4 flex items-center gap-3">
            <span className="text-[#5a8a5a]">04.</span> Using AI to Configure
          </h2>
          <p className="text-[#6a8a6a] mb-4">
            Copy this prompt into your AI coding assistant (Claude, Cursor, Copilot, etc.) to have it analyze your codebase and create a <code className="text-[#8aca8a] bg-[#0a120a] px-2 py-1 rounded-sm">blocks.yml</code> configuration:
          </p>

          <div className="bg-[#0a120a] border border-[#3a5a3a] rounded-sm overflow-hidden shadow-[0_0_20px_rgba(138,202,138,0.1)]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#080c08] border-b border-[#2a3a2a]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#aa4a4a]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#aa8a4a]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#4aaa4a]"></div>
                <span className="ml-3 text-[#5a8a5a] text-xs uppercase tracking-wider">
                  AI Agent Prompt
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
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Prompt
                  </>
                )}
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-[#8a9a8a] whitespace-pre-wrap font-mono leading-relaxed">
                {agentPrompt}
              </pre>
            </div>
          </div>
        </section>

        {/* What's Next */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#cadd6a] uppercase tracking-wide mb-4 flex items-center gap-3">
            <span className="text-[#5a8a5a]">05.</span> What's Next
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="/architecture"
              className="block bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4 hover:border-[#3a5a3a] transition-colors"
            >
              <h3 className="text-[#8aca8a] font-semibold mb-2">Architecture</h3>
              <p className="text-[#6a8a6a] text-sm">
                Understand how Blocks validates source code at development time.
              </p>
            </a>
            <a
              href="/docs"
              className="block bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4 hover:border-[#3a5a3a] transition-colors"
            >
              <h3 className="text-[#8aca8a] font-semibold mb-2">Documentation</h3>
              <p className="text-[#6a8a6a] text-sm">
                Deep dive into configuration options and validator types.
              </p>
            </a>
            <a
              href="/docs/examples"
              className="block bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4 hover:border-[#3a5a3a] transition-colors"
            >
              <h3 className="text-[#8aca8a] font-semibold mb-2">Examples</h3>
              <p className="text-[#6a8a6a] text-sm">
                See real-world Blocks configurations in action.
              </p>
            </a>
            <a
              href="https://github.com/anthropics/blocks"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4 hover:border-[#3a5a3a] transition-colors"
            >
              <h3 className="text-[#8aca8a] font-semibold mb-2">GitHub</h3>
              <p className="text-[#6a8a6a] text-sm">
                Star the repo and contribute to the project.
              </p>
            </a>
          </div>
        </section>

        {/* Environment Variables */}
        <section>
          <h2 className="text-xl font-bold text-[#cadd6a] uppercase tracking-wide mb-4 flex items-center gap-3">
            <span className="text-[#5a8a5a]">06.</span> Environment Setup
          </h2>
          <p className="text-[#6a8a6a] mb-4">
            The domain validator uses AI. Set your API key as an environment variable:
          </p>
          <div className="bg-[#0a120a] border border-[#2a3a2a] rounded-sm p-4">
            <div className="flex items-center justify-between">
              <code className="text-[#8aca8a]">export OPENAI_API_KEY=your-key-here</code>
              <CopyButton text="export OPENAI_API_KEY=your-key-here" />
            </div>
          </div>
          <p className="text-[#5a8a5a] text-sm mt-3">
            Supports OpenAI, Anthropic, and Google. See{" "}
            <a href="/docs" className="text-[#8aca8a] hover:text-[#cadd6a] transition-colors">
              docs
            </a>{" "}
            for configuration options.
          </p>
        </section>
      </main>

      {/* Footer */}
      <div className="border-t border-[#2a3a2a] bg-[#080c08] py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[#5a8a5a] text-sm">
            <div className="w-2 h-2 rounded-full bg-[#5a8a5a] animate-pulse" />
            <span className="uppercase tracking-wider">Terminal Blueprint Theme</span>
          </div>
        </div>
      </div>
    </div>
  );
}
