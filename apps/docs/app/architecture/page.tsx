"use client";

import { Nav } from "../components/nav";

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-[#fafcfa] dark:bg-[#050805] text-[#1e281e] dark:text-[#a0b0a0] font-mono">
      {/* Scanline overlay - only in dark mode */}
      <div
        className="fixed inset-0 pointer-events-none z-40 opacity-0 dark:opacity-[0.015]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)",
        }}
      />

      <Nav />

      {/* Header */}
      <div className="border-b border-[#c8dcc8] dark:border-[#2a3a2a] bg-[#ebf5eb] dark:bg-[#080c08]">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-[#708070] dark:border-[#5a8a5a] rotate-45" />
              <span className="text-xs uppercase tracking-[0.2em] text-[#708070] dark:text-[#5a8a5a]">
                Technical Reference
              </span>
              <div className="w-3 h-3 border border-[#708070] dark:border-[#5a8a5a] rotate-45" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#8cb43c] dark:text-[#cadd6a] mb-2 uppercase tracking-wide">
            Architecture
          </h1>
          <p className="text-[#506450] dark:text-[#6a8a6a]">
            How Blocks validates your code at development time
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Core Principle */}
        <section className="mb-16">
          <div className="p-8 border-2 border-[#708070] dark:border-[#5a8a5a] rounded-sm bg-[#f5faf5] dark:bg-[#0a120a]">
            <h2 className="text-2xl text-[#8cb43c] dark:text-[#cadd6a] mb-4 font-bold text-center">
              Spec → Validate → Ship
            </h2>
            <p className="text-[#506450] dark:text-[#8a9a8a] text-center max-w-2xl mx-auto mb-6">
              Define your domain rules. AI writes code. Blocks checks it.
              Fix drift or update spec. Repeat until aligned.
            </p>
            <div className="flex justify-center gap-3 text-sm">
              <span className="px-3 py-2 bg-[#ebf5eb] dark:bg-[#080c08] border border-[#a0c0a0] dark:border-[#3a5a3a] rounded-sm text-[#3c783c] dark:text-[#8aca8a]">blocks.yml</span>
              <span className="text-[#708070] dark:text-[#5a8a5a]">→</span>
              <span className="px-3 py-2 bg-[#ebf5eb] dark:bg-[#080c08] border border-[#a0c0a0] dark:border-[#3a5a3a] rounded-sm text-[#3c783c] dark:text-[#8aca8a]">blocks run</span>
              <span className="text-[#708070] dark:text-[#5a8a5a]">→</span>
              <span className="px-3 py-2 bg-[#ebf5eb] dark:bg-[#080c08] border border-[#8cb43c] dark:border-[#cadd6a] rounded-sm text-[#8cb43c] dark:text-[#cadd6a]">ship</span>
            </div>
          </div>
        </section>

        {/* Monorepo Structure */}
        <section className="mb-16">
          <h2 className="text-xl text-[#8cb43c] dark:text-[#cadd6a] mb-6 uppercase tracking-wide flex items-center gap-4">
            <span className="w-8 h-8 flex items-center justify-center border border-[#708070] dark:border-[#5a8a5a] rounded-sm text-sm">
              01
            </span>
            Monorepo Structure
            <div className="flex-1 h-px bg-[#c8dcc8] dark:bg-[#2a3a2a]" />
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: "@blocksai/cli",
                desc: "Command-line interface for running validations",
                color: "text-[#8cb43c] dark:text-[#cadd6a]",
              },
              {
                name: "@blocksai/schema",
                desc: "Parses and validates blocks.yml configuration",
                color: "text-[#3c783c] dark:text-[#8aca8a]",
              },
              {
                name: "@blocksai/domain",
                desc: "Domain modeling, entities, and static analysis",
                color: "text-[#3c783c] dark:text-[#8aca8a]",
              },
              {
                name: "@blocksai/validators",
                desc: "Schema, Shape, and Domain validator implementations",
                color: "text-[#3c783c] dark:text-[#8aca8a]",
              },
              {
                name: "@blocksai/ai",
                desc: "Multi-provider AI abstraction (OpenAI, Anthropic, Google)",
                color: "text-[#3c783c] dark:text-[#8aca8a]",
              },
            ].map((pkg) => (
              <div
                key={pkg.name}
                className="p-4 border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm bg-[#f5faf5] dark:bg-[#0a120a] hover:border-[#a0c0a0] dark:hover:border-[#3a5a3a] transition-colors"
              >
                <div className={`text-sm font-bold mb-2 ${pkg.color}`}>
                  {pkg.name}
                </div>
                <div className="text-xs text-[#506450] dark:text-[#6a8a6a]">{pkg.desc}</div>
              </div>
            ))}
          </div>

          {/* Dependency flow */}
          <div className="mt-6 p-4 border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm bg-[#ebf5eb] dark:bg-[#080c08]">
            <div className="text-xs text-[#708070] dark:text-[#5a8a5a] uppercase tracking-wider mb-3">
              Dependency Flow
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="px-3 py-1.5 border border-[#708070] dark:border-[#5a8a5a] rounded-sm text-[#8cb43c] dark:text-[#cadd6a]">
                cli
              </span>
              <span className="text-[#708070] dark:text-[#5a8a5a]">→</span>
              <span className="px-3 py-1.5 border border-[#a0c0a0] dark:border-[#3a5a3a] rounded-sm text-[#3c783c] dark:text-[#8aca8a]">
                validators
              </span>
              <span className="text-[#708070] dark:text-[#5a8a5a]">→</span>
              <span className="px-3 py-1.5 border border-[#a0c0a0] dark:border-[#3a5a3a] rounded-sm text-[#3c783c] dark:text-[#8aca8a]">
                domain
              </span>
              <span className="text-[#708070] dark:text-[#5a8a5a]">→</span>
              <span className="px-3 py-1.5 border border-[#a0c0a0] dark:border-[#3a5a3a] rounded-sm text-[#3c783c] dark:text-[#8aca8a]">
                schema
              </span>
              <span className="text-[#708070] dark:text-[#5a8a5a] mx-2">|</span>
              <span className="px-3 py-1.5 border border-[#a0c0a0] dark:border-[#3a5a3a] rounded-sm text-[#3c783c] dark:text-[#8aca8a]">
                validators
              </span>
              <span className="text-[#708070] dark:text-[#5a8a5a]">→</span>
              <span className="px-3 py-1.5 border border-[#708070] dark:border-[#5a8a5a] rounded-sm text-[#8cb43c] dark:text-[#cadd6a]">
                ai
              </span>
            </div>
          </div>
        </section>

        {/* Validation Pipeline */}
        <section className="mb-16">
          <h2 className="text-xl text-[#8cb43c] dark:text-[#cadd6a] mb-6 uppercase tracking-wide flex items-center gap-4">
            <span className="w-8 h-8 flex items-center justify-center border border-[#708070] dark:border-[#5a8a5a] rounded-sm text-sm">
              02
            </span>
            Validation Pipeline
            <div className="flex-1 h-px bg-[#c8dcc8] dark:bg-[#2a3a2a]" />
          </h2>

          <div className="space-y-4">
            {[
              {
                stage: "1",
                name: "Schema Validator",
                id: "schema.io",
                speed: "Fast",
                desc: "Validates input/output signatures match blocks.yml",
                checks: [
                  "All inputs have name and type",
                  "All outputs have name and type",
                  "Types match entity definitions",
                ],
              },
              {
                stage: "2",
                name: "Shape Validator",
                id: "shape.exports.ts",
                speed: "Fast",
                desc: "Validates file structure and TypeScript exports",
                checks: [
                  "Required files exist (index.ts, block.ts)",
                  "TypeScript exports are present",
                  "Entry points properly defined",
                ],
              },
              {
                stage: "3",
                name: "Domain Validator",
                id: "domain.validation",
                speed: "AI-powered",
                desc: "Semantic validation against domain rules using AI",
                checks: [
                  "Philosophy adherence",
                  "Semantic HTML compliance",
                  "Domain rule violations",
                  "Code quality patterns",
                ],
              },
            ].map((v) => (
              <div
                key={v.stage}
                className="p-5 border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm bg-[#f5faf5] dark:bg-[#0a120a] hover:border-[#a0c0a0] dark:hover:border-[#3a5a3a] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-[#ebf5eb] dark:bg-[#0f1a0f] border border-[#708070] dark:border-[#5a8a5a] rounded-sm text-xs text-[#3c783c] dark:text-[#8aca8a]">
                      {v.stage}
                    </span>
                    <div>
                      <div className="text-[#8cb43c] dark:text-[#cadd6a] font-bold">{v.name}</div>
                      <code className="text-xs text-[#708070] dark:text-[#5a8a5a]">{v.id}</code>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-sm border ${
                      v.speed === "AI-powered"
                        ? "border-[#8cb43c] dark:border-[#8aaa4a] text-[#8cb43c] dark:text-[#cadd6a] bg-[#f5faf5] dark:bg-[#121a08]"
                        : "border-[#a0c0a0] dark:border-[#3a5a3a] text-[#506450] dark:text-[#6a8a6a]"
                    }`}
                  >
                    {v.speed}
                  </span>
                </div>
                <p className="text-sm text-[#506450] dark:text-[#8a9a8a] mb-3">{v.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {v.checks.map((check, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-[#ebf5eb] dark:bg-[#080c08] border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm text-[#506450] dark:text-[#6a8a6a]"
                    >
                      {check}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pipeline visualization */}
          <div className="mt-6 p-4 border border-[#a0c0a0] dark:border-[#3a5a3a] rounded-sm bg-[#f5faf5] dark:bg-[#0a120a]">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#708070] dark:bg-[#5a8a5a]" />
                <span className="text-[#506450] dark:text-[#6a8a6a]">blocks.yml</span>
              </div>
              <div className="flex-1 mx-4 h-0.5 bg-gradient-to-r from-[#708070] dark:from-[#5a8a5a] via-[#8cb43c] dark:via-[#8aaa4a] to-[#8cb43c] dark:to-[#cadd6a]" />
              <div className="flex items-center gap-2">
                <span className="text-[#8cb43c] dark:text-[#cadd6a]">ValidationResult[]</span>
                <div className="w-2 h-2 rounded-full bg-[#8cb43c] dark:bg-[#cadd6a]" />
              </div>
            </div>
          </div>
        </section>

        {/* AI Integration */}
        <section className="mb-16">
          <h2 className="text-xl text-[#8cb43c] dark:text-[#cadd6a] mb-6 uppercase tracking-wide flex items-center gap-4">
            <span className="w-8 h-8 flex items-center justify-center border border-[#708070] dark:border-[#5a8a5a] rounded-sm text-sm">
              03
            </span>
            AI Integration
            <div className="flex-1 h-px bg-[#c8dcc8] dark:bg-[#2a3a2a]" />
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* What's sent to AI */}
            <div className="p-5 border border-[#a0c0a0] dark:border-[#3a5a3a] rounded-sm bg-[#f5faf5] dark:bg-[#0a120a]">
              <h3 className="text-sm text-[#3c783c] dark:text-[#8aca8a] uppercase tracking-wider mb-4">
                Context Sent to AI
              </h3>
              <ul className="space-y-2 text-sm">
                {[
                  "Project philosophy from blocks.yml",
                  "Domain entities and semantics",
                  "ALL source files in block directory",
                  "Domain rules (global + block-specific)",
                  "Validation instructions",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#506450] dark:text-[#8a9a8a]">
                    <span className="text-[#3c783c] dark:text-[#8aca8a]">→</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-[#c8dcc8] dark:border-[#2a3a2a]">
                <div className="text-xs text-[#708070] dark:text-[#5a8a5a] uppercase tracking-wider mb-2">
                  Excluded
                </div>
                <div className="flex flex-wrap gap-2">
                  {["node_modules", "dist", "build", ".git", "coverage"].map(
                    (dir) => (
                      <code
                        key={dir}
                        className="text-xs px-2 py-1 bg-[#ebf5eb] dark:bg-[#080c08] border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm text-[#708070] dark:text-[#5a7a5a]"
                      >
                        {dir}/
                      </code>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Providers */}
            <div className="p-5 border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm bg-[#f5faf5] dark:bg-[#0a120a]">
              <h3 className="text-sm text-[#3c783c] dark:text-[#8aca8a] uppercase tracking-wider mb-4">
                Supported Providers
              </h3>
              <div className="space-y-3">
                {[
                  { name: "OpenAI", models: "gpt-4o, gpt-4o-mini" },
                  { name: "Anthropic", models: "claude-3-5-sonnet, claude-3-5-haiku" },
                  { name: "Google", models: "gemini-1.5-pro, gemini-1.5-flash" },
                ].map((provider) => (
                  <div
                    key={provider.name}
                    className="flex items-center justify-between p-3 border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm"
                  >
                    <span className="text-[#3c783c] dark:text-[#8aca8a] font-medium">
                      {provider.name}
                    </span>
                    <span className="text-xs text-[#708070] dark:text-[#5a8a5a]">{provider.models}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-[#708070] dark:text-[#5a8a5a]">
                Powered by Vercel AI SDK for universal provider interface
              </p>
            </div>
          </div>
        </section>

        {/* Configuration Example */}
        <section className="mb-16">
          <h2 className="text-xl text-[#8cb43c] dark:text-[#cadd6a] mb-6 uppercase tracking-wide flex items-center gap-4">
            <span className="w-8 h-8 flex items-center justify-center border border-[#708070] dark:border-[#5a8a5a] rounded-sm text-sm">
              04
            </span>
            Configuration
            <div className="flex-1 h-px bg-[#c8dcc8] dark:bg-[#2a3a2a]" />
          </h2>

          <div className="p-5 border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm bg-[#ebf5eb] dark:bg-[#080c08] overflow-x-auto">
            <pre className="text-sm leading-relaxed">
              <span className="text-[#708070] dark:text-[#5a8a5a]"># blocks.yml</span>
              {"\n"}
              <span className="text-[#8cb43c] dark:text-[#cadd6a]">$schema</span>
              <span className="text-[#506450] dark:text-[#8a9a8a]">: </span>
              <span className="text-[#3c783c] dark:text-[#8aca8a]">"blocks/v2"</span>
              {"\n"}
              <span className="text-[#8cb43c] dark:text-[#cadd6a]">name</span>
              <span className="text-[#506450] dark:text-[#8a9a8a]">: </span>
              <span className="text-[#3c783c] dark:text-[#8aca8a]">"my-project"</span>
              {"\n\n"}
              <span className="text-[#8cb43c] dark:text-[#cadd6a]">philosophy</span>
              <span className="text-[#506450] dark:text-[#8a9a8a]">:</span>
              {"\n"}
              <span className="text-[#506450] dark:text-[#8a9a8a]">  - </span>
              <span className="text-[#3c783c] dark:text-[#8aca8a]">"Use semantic HTML tags"</span>
              {"\n"}
              <span className="text-[#506450] dark:text-[#8a9a8a]">  - </span>
              <span className="text-[#3c783c] dark:text-[#8aca8a]">"Accessibility is required"</span>
              {"\n\n"}
              <span className="text-[#8cb43c] dark:text-[#cadd6a]">validators</span>
              <span className="text-[#506450] dark:text-[#8a9a8a]">:</span>
              {"\n"}
              <span className="text-[#506450] dark:text-[#8a9a8a]">  - </span>
              <span className="text-[#3c783c] dark:text-[#8aca8a]">schema</span>
              {"\n"}
              <span className="text-[#506450] dark:text-[#8a9a8a]">  - </span>
              <span className="text-[#3c783c] dark:text-[#8aca8a]">shape</span>
              {"\n"}
              <span className="text-[#506450] dark:text-[#8a9a8a]">  - </span>
              <span className="text-[#8cb43c] dark:text-[#cadd6a]">name</span>
              <span className="text-[#506450] dark:text-[#8a9a8a]">: </span>
              <span className="text-[#3c783c] dark:text-[#8aca8a]">domain</span>
              {"\n"}
              <span className="text-[#506450] dark:text-[#8a9a8a]">    </span>
              <span className="text-[#8cb43c] dark:text-[#cadd6a]">config</span>
              <span className="text-[#506450] dark:text-[#8a9a8a]">:</span>
              {"\n"}
              <span className="text-[#506450] dark:text-[#8a9a8a]">      </span>
              <span className="text-[#8cb43c] dark:text-[#cadd6a]">rules</span>
              <span className="text-[#506450] dark:text-[#8a9a8a]">:</span>
              {"\n"}
              <span className="text-[#506450] dark:text-[#8a9a8a]">        - </span>
              <span className="text-[#8cb43c] dark:text-[#cadd6a]">id</span>
              <span className="text-[#506450] dark:text-[#8a9a8a]">: </span>
              <span className="text-[#3c783c] dark:text-[#8aca8a]">no_inline_styles</span>
              {"\n\n"}
              <span className="text-[#8cb43c] dark:text-[#cadd6a]">blocks</span>
              <span className="text-[#506450] dark:text-[#8a9a8a]">:</span>
              {"\n"}
              <span className="text-[#506450] dark:text-[#8a9a8a]">  </span>
              <span className="text-[#8cb43c] dark:text-[#cadd6a]">theme.modern</span>
              <span className="text-[#506450] dark:text-[#8a9a8a]">:</span>
              {"\n"}
              <span className="text-[#506450] dark:text-[#8a9a8a]">    </span>
              <span className="text-[#8cb43c] dark:text-[#cadd6a]">path</span>
              <span className="text-[#506450] dark:text-[#8a9a8a]">: </span>
              <span className="text-[#3c783c] dark:text-[#8aca8a]">blocks/theme-modern</span>
              {"\n"}
              <span className="text-[#506450] dark:text-[#8a9a8a]">    </span>
              <span className="text-[#8cb43c] dark:text-[#cadd6a]">inputs</span>
              <span className="text-[#506450] dark:text-[#8a9a8a]">:</span>
              {"\n"}
              <span className="text-[#506450] dark:text-[#8a9a8a]">      - </span>
              <span className="text-[#8cb43c] dark:text-[#cadd6a]">name</span>
              <span className="text-[#506450] dark:text-[#8a9a8a]">: </span>
              <span className="text-[#3c783c] dark:text-[#8aca8a]">data</span>
              {"\n"}
              <span className="text-[#506450] dark:text-[#8a9a8a]">        </span>
              <span className="text-[#8cb43c] dark:text-[#cadd6a]">type</span>
              <span className="text-[#506450] dark:text-[#8a9a8a]">: </span>
              <span className="text-[#3c783c] dark:text-[#8aca8a]">object</span>
            </pre>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-[#c8dcc8] dark:border-[#2a3a2a]">
          <div className="flex items-center justify-between text-xs text-[#708070] dark:text-[#4a6a4a]">
            <a
              href="/docs"
              className="hover:text-[#3c783c] dark:hover:text-[#8aca8a] transition-colors"
            >
              ← Back to Documentation
            </a>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#3c783c] dark:bg-[#5a8a5a] animate-pulse" />
              <span className="uppercase tracking-wider">Blocks Framework</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
