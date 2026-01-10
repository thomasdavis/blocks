"use client";

import { useState } from "react";
import Link from "next/link";

// Terminal-style box component
function TerminalBox({
  title,
  children,
  variant = "default",
  className = "",
  onClick,
  isActive,
  details,
}: {
  title: string;
  children?: React.ReactNode;
  variant?: "default" | "highlight" | "accent" | "muted";
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
  details?: React.ReactNode;
}) {
  const variants = {
    default: "border-[#3a5a3a] bg-[#0a120a]/80",
    highlight: "border-[#5a8a5a] bg-[#0f1a0f]/90",
    accent: "border-[#8aaa4a] bg-[#121a08]/90",
    muted: "border-[#2a3a2a] bg-[#080c08]/60",
  };

  const titleColors = {
    default: "text-[#6a9a6a]",
    highlight: "text-[#8aca8a]",
    accent: "text-[#cadd6a]",
    muted: "text-[#4a6a4a]",
  };

  return (
    <div
      className={`
        relative border rounded-sm p-3
        ${variants[variant]}
        ${onClick ? "cursor-pointer hover:border-[#8aca8a] hover:bg-[#0f1a0f] transition-all duration-200" : ""}
        ${isActive ? "border-[#cadd6a] ring-1 ring-[#cadd6a]/30" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      <div className={`text-xs font-mono uppercase tracking-wider mb-2 ${titleColors[variant]}`}>
        {title}
      </div>
      {children}
      {details && isActive && (
        <div className="mt-3 pt-3 border-t border-[#3a5a3a]/50 text-[#8a9a8a] text-xs font-mono">
          {details}
        </div>
      )}
    </div>
  );
}

// Arrow connector
function Arrow({ direction = "down", className = "" }: { direction?: "down" | "right"; className?: string }) {
  if (direction === "right") {
    return (
      <div className={`flex items-center justify-center px-2 ${className}`}>
        <div className="flex items-center">
          <div className="w-8 h-[1px] bg-[#5a8a5a]" />
          <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[#5a8a5a]" />
        </div>
      </div>
    );
  }
  return (
    <div className={`flex flex-col items-center justify-center py-2 ${className}`}>
      <div className="h-6 w-[1px] bg-[#5a8a5a]" />
      <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#5a8a5a]" />
    </div>
  );
}

// Section header
function SectionHeader({ children, number }: { children: React.ReactNode; number: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center justify-center w-8 h-8 rounded border border-[#5a8a5a] bg-[#0a120a] text-[#8aca8a] font-mono text-sm">
        {number}
      </div>
      <h2 className="text-xl font-mono text-[#cadd6a] uppercase tracking-wide">{children}</h2>
      <div className="flex-1 h-[1px] bg-gradient-to-r from-[#3a5a3a] to-transparent" />
    </div>
  );
}

export default function ArchitecturePage() {
  const [activePackage, setActivePackage] = useState<string | null>(null);
  const [activeValidator, setActiveValidator] = useState<string | null>(null);
  const [activeFlow, setActiveFlow] = useState<number | null>(null);

  const packages = {
    cli: {
      name: "@blocksai/cli",
      desc: "Command-line interface",
      details: "Entry point for validation. Loads blocks.yml, orchestrates validators, outputs results.",
      exports: ["blocks init", "blocks run", "blocks run --all"],
    },
    schema: {
      name: "@blocksai/schema",
      desc: "YAML configuration parser",
      details: "Parses and validates blocks.yml structure using Zod schemas.",
      exports: ["parseBlocksConfig()", "validateBlocksConfig()", "BlocksConfigSchema"],
    },
    domain: {
      name: "@blocksai/domain",
      desc: "Domain modeling & analysis",
      details: "Central registry for entities, semantics, and domain rules. Static analysis without AI.",
      exports: ["DomainRegistry", "DomainAnalyzer", "getEntities()", "getSemantics()"],
    },
    validators: {
      name: "@blocksai/validators",
      desc: "Core validation implementations",
      details: "Three validator types: Schema (I/O signatures), Shape (file structure), Domain (AI semantic).",
      exports: ["SchemaValidator", "ShapeValidator", "DomainValidator", "ValidatorRegistry"],
    },
    ai: {
      name: "@blocksai/ai",
      desc: "AI provider abstraction",
      details: "Multi-provider support via Vercel AI SDK. OpenAI, Anthropic, Google Gemini.",
      exports: ["AIProvider", "generateStructured()", "validateDomainSemantics()"],
    },
  };

  const validators = {
    schema: {
      name: "Schema Validator",
      id: "schema.io",
      speed: "Fast",
      desc: "Validates input/output signatures match blocks.yml definitions",
      checks: ["All inputs have name and type", "All outputs have name and type", "Types match entity definitions"],
    },
    shape: {
      name: "Shape Validator",
      id: "shape.exports.ts",
      speed: "Fast",
      desc: "Validates file structure and exports",
      checks: ["Required files exist (index.ts, block.ts)", "TypeScript exports are present", "Entry points defined"],
    },
    domain: {
      name: "Domain Validator",
      id: "domain.validation",
      speed: "Slow (AI)",
      desc: "AI-powered semantic validation against domain rules",
      checks: ["Philosophy adherence", "Semantic HTML compliance", "Domain rule violations", "Code quality patterns"],
    },
  };

  const flowSteps = [
    { label: "blocks.yml", desc: "Configuration loaded and parsed" },
    { label: "Block Resolution", desc: "Paths resolved, files discovered" },
    { label: "Validator Pipeline", desc: "schema → shape → domain" },
    { label: "AI Analysis", desc: "All source files sent to AI" },
    { label: "Results", desc: "Issues collected, formatted output" },
  ];

  return (
    <div className="min-h-screen bg-[#050805] text-[#a0b0a0] font-mono selection:bg-[#5a8a5a]/30">
      {/* Scanline overlay effect */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)",
        }}
      />

      {/* Vignette effect */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-[#2a3a2a] bg-[#080c08]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-6 h-6 rounded border border-[#5a8a5a] flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#8aca8a] rounded-sm" />
                </div>
                <span className="text-[#8aca8a] font-bold tracking-wide">BLOCKS</span>
              </Link>
              <div className="text-[#4a5a4a] text-sm">/</div>
              <div className="text-[#6a8a6a] text-sm uppercase tracking-wider">Architecture</div>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#4a6a4a]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#5a8a5a] animate-pulse" />
                <span>SYSTEM ACTIVE</span>
              </div>
              <div className="px-2 py-1 border border-[#2a3a2a] rounded text-[#6a8a6a]">
                v2.0
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 border border-[#3a5a3a] rounded bg-[#0a120a]/50">
            <div className="w-3 h-3 border border-[#5a8a5a] rotate-45" />
            <span className="text-xs uppercase tracking-[0.3em] text-[#6a9a6a]">Technical Reference</span>
            <div className="w-3 h-3 border border-[#5a8a5a] rotate-45" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#cadd6a] mb-4 tracking-tight">
            BLOCKS ARCHITECTURE
          </h1>
          <p className="text-[#6a8a6a] max-w-2xl mx-auto">
            Development-time validation framework for semantic code analysis.
            <br />
            <span className="text-[#8a9a8a]">Click on any component to explore details.</span>
          </p>
        </div>

        {/* Section 1: Monorepo Structure */}
        <section className="mb-20">
          <SectionHeader number="01">Monorepo Structure</SectionHeader>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {Object.entries(packages).map(([key, pkg]) => (
              <TerminalBox
                key={key}
                title={pkg.name}
                variant={activePackage === key ? "accent" : "default"}
                onClick={() => setActivePackage(activePackage === key ? null : key)}
                isActive={activePackage === key}
                details={
                  <div>
                    <div className="mb-2">{pkg.details}</div>
                    <div className="mt-2 pt-2 border-t border-[#2a3a2a]">
                      <div className="text-[#6a9a6a] mb-1">Exports:</div>
                      {pkg.exports.map((exp, i) => (
                        <div key={i} className="text-[#cadd6a]">• {exp}</div>
                      ))}
                    </div>
                  </div>
                }
              >
                <div className="text-sm text-[#8a9a8a]">{pkg.desc}</div>
              </TerminalBox>
            ))}
          </div>

          {/* Dependency graph */}
          <div className="mt-8 p-6 border border-[#2a3a2a] rounded bg-[#080c08]/50">
            <div className="text-xs uppercase tracking-wider text-[#5a8a5a] mb-4">Dependency Graph</div>
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="px-2 py-1 border border-[#5a8a5a] rounded text-[#8aca8a]">cli</span>
              <Arrow direction="right" />
              <span className="px-2 py-1 border border-[#3a5a3a] rounded text-[#6a9a6a]">validators</span>
              <Arrow direction="right" />
              <span className="px-2 py-1 border border-[#3a5a3a] rounded text-[#6a9a6a]">domain</span>
              <Arrow direction="right" />
              <span className="px-2 py-1 border border-[#3a5a3a] rounded text-[#6a9a6a]">schema</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs mt-4">
              <span className="px-2 py-1 border border-[#3a5a3a] rounded text-[#6a9a6a]">validators</span>
              <Arrow direction="right" />
              <span className="px-2 py-1 border border-[#8aaa4a] rounded text-[#cadd6a]">ai</span>
              <span className="text-[#4a6a4a] mx-2">(for domain validation)</span>
            </div>
          </div>
        </section>

        {/* Section 2: Validation Pipeline */}
        <section className="mb-20">
          <SectionHeader number="02">Validation Pipeline</SectionHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {Object.entries(validators).map(([key, val], index) => (
              <div key={key} className="flex flex-col items-center">
                <TerminalBox
                  title={`Stage ${index + 1}`}
                  variant={activeValidator === key ? "highlight" : "default"}
                  onClick={() => setActiveValidator(activeValidator === key ? null : key)}
                  isActive={activeValidator === key}
                  className="w-full"
                  details={
                    <div>
                      <div className="mb-2">{val.desc}</div>
                      <div className="mt-2 pt-2 border-t border-[#2a3a2a]">
                        <div className="text-[#6a9a6a] mb-1">Checks:</div>
                        {val.checks.map((check, i) => (
                          <div key={i} className="text-[#8aca8a]">✓ {check}</div>
                        ))}
                      </div>
                    </div>
                  }
                >
                  <div className="text-lg text-[#cadd6a] mb-1">{val.name}</div>
                  <div className="text-xs text-[#5a8a5a] mb-2 font-mono">{val.id}</div>
                  <div className="inline-flex px-2 py-0.5 rounded text-xs border border-[#3a5a3a] text-[#6a9a6a]">
                    {val.speed}
                  </div>
                </TerminalBox>
                {index < 2 && (
                  <Arrow direction="down" className="hidden md:flex" />
                )}
              </div>
            ))}
          </div>

          {/* Pipeline visualization */}
          <div className="p-6 border border-[#3a5a3a] rounded bg-[#0a120a]/70">
            <div className="text-xs uppercase tracking-wider text-[#5a8a5a] mb-4">Pipeline Execution</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#5a8a5a]" />
                <span className="text-xs text-[#6a9a6a]">Input</span>
              </div>
              <div className="flex-1 mx-4 h-[2px] bg-gradient-to-r from-[#5a8a5a] via-[#8aaa4a] to-[#cadd6a]" />
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#cadd6a]">Output</span>
                <div className="w-3 h-3 rounded-full bg-[#cadd6a]" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-[#4a6a4a]">
              <span>blocks.yml</span>
              <span>schema.io</span>
              <span>shape.exports.ts</span>
              <span>domain.validation</span>
              <span>ValidationResult[]</span>
            </div>
          </div>
        </section>

        {/* Section 3: Configuration Flow */}
        <section className="mb-20">
          <SectionHeader number="03">Configuration Flow</SectionHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* blocks.yml structure */}
            <div>
              <div className="text-xs uppercase tracking-wider text-[#5a8a5a] mb-4">blocks.yml Schema</div>
              <TerminalBox title="Configuration Structure" variant="muted" className="h-full">
                <pre className="text-xs leading-relaxed overflow-x-auto">
{`$schema: "blocks/v2"
name: "project-name"

`}<span className="text-[#cadd6a]">philosophy:</span>{`
  - "Domain rules for AI guidance"

`}<span className="text-[#cadd6a]">domain:</span>{`
  `}<span className="text-[#8aca8a]">entities:</span>{`
    user: { fields: [id, name, email] }
  `}<span className="text-[#8aca8a]">semantics:</span>{`
    quality: { description: "Score 0-1" }

`}<span className="text-[#cadd6a]">validators:</span>{`
  - schema
  - shape
  - name: domain
    config:
      rules:
        - id: semantic_html
          description: "Use semantic tags"

`}<span className="text-[#cadd6a]">blocks:</span>{`
  my.block:
    description: "Block definition"
    path: blocks/my-block
    inputs:
      - name: data
        type: entity.user
    outputs:
      - name: result
        type: string`}
                </pre>
              </TerminalBox>
            </div>

            {/* Flow steps */}
            <div>
              <div className="text-xs uppercase tracking-wider text-[#5a8a5a] mb-4">Execution Flow</div>
              <div className="space-y-3">
                {flowSteps.map((step, i) => (
                  <TerminalBox
                    key={i}
                    title={`Step ${i + 1}`}
                    variant={activeFlow === i ? "accent" : "default"}
                    onClick={() => setActiveFlow(activeFlow === i ? null : i)}
                    isActive={activeFlow === i}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#cadd6a]">{step.label}</span>
                      <span className="text-xs text-[#5a8a5a]">{step.desc}</span>
                    </div>
                  </TerminalBox>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Core Principle */}
        <section className="mb-20">
          <SectionHeader number="04">Core Principle</SectionHeader>

          <div className="p-8 border-2 border-[#5a8a5a] rounded bg-[#0a120a]/80 text-center">
            <div className="text-2xl text-[#cadd6a] mb-4 font-bold">
              Development-Time Validation
            </div>
            <div className="text-[#8a9a8a] max-w-2xl mx-auto mb-8">
              Blocks validates <span className="text-[#cadd6a]">SOURCE CODE</span> at development time,
              not runtime behavior. Templates are deterministic: same input → same template → same output.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
              <TerminalBox title="Development-Time" variant="highlight">
                <ul className="text-sm space-y-1 text-[#8aca8a]">
                  <li>✓ Validate source code</li>
                  <li>✓ AI analyzes all files</li>
                  <li>✓ Semantic feedback</li>
                  <li>✓ Iterative improvement</li>
                </ul>
              </TerminalBox>
              <TerminalBox title="Runtime" variant="muted">
                <ul className="text-sm space-y-1 text-[#6a8a6a]">
                  <li>• Validate input data only</li>
                  <li>• No template validation</li>
                  <li>• Trust validated code</li>
                  <li>• Simple execution</li>
                </ul>
              </TerminalBox>
            </div>
          </div>
        </section>

        {/* Section 5: AI Integration */}
        <section className="mb-20">
          <SectionHeader number="05">AI Integration</SectionHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TerminalBox title="Context Sent to AI" variant="highlight" className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[#6a9a6a] text-xs uppercase mb-2">Included</div>
                  <ul className="space-y-1 text-[#8aca8a]">
                    <li>• Project philosophy</li>
                    <li>• Domain concepts</li>
                    <li>• ALL block files</li>
                    <li>• Domain rules</li>
                    <li>• Validation instructions</li>
                  </ul>
                </div>
                <div>
                  <div className="text-[#6a9a6a] text-xs uppercase mb-2">Excluded</div>
                  <ul className="space-y-1 text-[#5a7a5a]">
                    <li>• node_modules/</li>
                    <li>• dist/, build/</li>
                    <li>• .git/, .turbo/</li>
                    <li>• coverage/</li>
                    <li>• Custom exclude patterns</li>
                  </ul>
                </div>
              </div>
            </TerminalBox>

            <TerminalBox title="Supported Providers" variant="default">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-2 border border-[#2a3a2a] rounded">
                  <span className="text-[#8aca8a]">OpenAI</span>
                  <span className="text-xs text-[#5a8a5a]">gpt-4o-mini</span>
                </div>
                <div className="flex items-center justify-between p-2 border border-[#2a3a2a] rounded">
                  <span className="text-[#8aca8a]">Anthropic</span>
                  <span className="text-xs text-[#5a8a5a]">claude-3-5-sonnet</span>
                </div>
                <div className="flex items-center justify-between p-2 border border-[#2a3a2a] rounded">
                  <span className="text-[#8aca8a]">Google</span>
                  <span className="text-xs text-[#5a8a5a]">gemini-1.5-flash</span>
                </div>
              </div>
            </TerminalBox>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-12 border-t border-[#2a3a2a]">
          <div className="flex items-center justify-between text-xs text-[#4a6a4a]">
            <div className="flex items-center gap-4">
              <Link href="/docs" className="hover:text-[#8aca8a] transition-colors">
                ← Documentation
              </Link>
              <Link href="/docs/specification/blocks-yml" className="hover:text-[#8aca8a] transition-colors">
                blocks.yml Spec
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#5a8a5a]" />
              <span>BLOCKS FRAMEWORK</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
