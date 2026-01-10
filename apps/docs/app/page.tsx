import Link from 'next/link';
import { CopyButton } from './copy-button';
import { AISlogan } from './ai-slogan';
import { getButtonClassName } from '@blocksai/ui/button';
import { Nav } from './components/nav';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050805] text-[#a0b0a0] font-mono">
      {/* Scanline overlay effect */}
      <div
        className="fixed inset-0 pointer-events-none z-40 opacity-[0.015]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)",
        }}
      />

      <Nav />
      <main>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto rounded-sm bg-[#0a120a] border-2 border-[#3a5a3a] flex items-center justify-center shadow-[0_0_30px_rgba(138,202,138,0.2)]">
              <div className="text-[#cadd6a] text-4xl font-bold">B</div>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-[#8aca8a] uppercase">
            Guardrails That Keep Your
            <br />
            <span className="text-[#cadd6a]">Agentic Code Generation</span>
            <br />
            Aligned With Your Domain
          </h1>

          {/* AI-Generated Elevator Pitch */}
          <div className="mb-8">
            <AISlogan />
          </div>

          {/* Quick Start */}
          <div className="bg-[#0a120a] rounded-sm p-6 mb-8 max-w-2xl mx-auto border border-[#3a5a3a] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <p className="text-[#5a8a5a] text-sm mb-3 uppercase tracking-wider">Get started in seconds:</p>
            <div className="bg-[#080c08] border border-[#2a3a2a] rounded-sm px-4 py-3 text-sm text-left text-[#8aca8a] flex items-center justify-between">
              <code>npm install -g @blocksai/cli</code>
              <CopyButton text="npm install -g @blocksai/cli" />
            </div>
            <div className="mt-3 bg-[#080c08] border border-[#2a3a2a] rounded-sm px-4 py-3 text-sm text-left text-[#8aca8a]">
              <code>blocks run my-block</code>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/getting-started"
              className={getButtonClassName("primary", "lg")}
            >
              Get Started
            </Link>
            <Link
              href="#examples"
              className={getButtonClassName("outline", "lg")}
            >
              View Live Examples
            </Link>
            <Link
              href="/changelog"
              className={getButtonClassName("outline", "lg")}
            >
              Changelog
            </Link>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-[#0a120a] rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden border border-[#3a5a3a]">
            <div className="px-6 py-4 bg-[#080c08] border-b border-[#2a3a2a]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#aa4a4a]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#aa8a4a]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#4aaa4a]"></div>
                <span className="ml-3 text-[#5a8a5a] text-xs uppercase tracking-wider">blocks.yml</span>
              </div>
            </div>
            <pre className="p-6 overflow-x-auto text-sm">
              <code className="text-[#8a9a8a]">
{`$schema: "blocks/v2"

philosophy:
  - "Blog posts must include humor"

domain:
  semantics:
    humor_score:
      description: "How funny is this content?"

validators:
  - schema
  - name: domain
    config:
      rules:
        - id: humor_required
          description: "Must include wit"

blocks:
  validator.blog_post:
    description: "Validates blog content"
    path: "validators/blog"`}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Human-AI Collaboration */}
      <div className="bg-[#080c08] border-y border-[#2a3a2a] py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#cadd6a] uppercase tracking-wide">
                Not Locking Down Code—Giving You a Semantic Compass
              </h2>
              <p className="text-[#6a8a6a] max-w-3xl mx-auto">
                Blocks doesn't restrict who can edit code. Instead, it detects when either humans or AI introduce drift from the spec.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#0a120a] rounded-sm p-6 border border-[#2a3a2a] hover:border-[#3a5a3a] transition-colors">
                <div className="text-2xl mb-3 text-[#8aca8a]">[✓]</div>
                <h3 className="text-lg font-semibold mb-2 text-[#8aca8a]">Humans Write Code</h3>
                <p className="text-[#6a8a6a] text-sm">
                  You're free to modify any block. Write, refactor, experiment—Blocks won't stop you.
                </p>
              </div>

              <div className="bg-[#0a120a] rounded-sm p-6 border border-[#2a3a2a] hover:border-[#3a5a3a] transition-colors">
                <div className="text-2xl mb-3 text-[#8aca8a]">[&gt;_]</div>
                <h3 className="text-lg font-semibold mb-2 text-[#8aca8a]">AI Agents Write Code</h3>
                <p className="text-[#6a8a6a] text-sm">
                  Any AI coding assistant can modify blocks. LLM agnostic—works with all providers.
                </p>
              </div>

              <div className="bg-[#0a120a] rounded-sm p-6 border border-[#2a3a2a] hover:border-[#3a5a3a] transition-colors">
                <div className="text-2xl mb-3 text-[#cadd6a]">[~]</div>
                <h3 className="text-lg font-semibold mb-2 text-[#8aca8a]">Blocks Detects Drift</h3>
                <p className="text-[#6a8a6a] text-sm">
                  Run validation. Blocks reports drift and helps you decide: fix code or update spec.
                </p>
              </div>
            </div>

            <div className="mt-12 bg-[#0a120a] rounded-sm p-8 border border-[#3a5a3a]">
              <h3 className="text-lg font-semibold mb-4 text-[#cadd6a] uppercase tracking-wide">The Validation Loop</h3>
              <div className="space-y-3 text-[#8a9a8a]">
                <div className="flex items-start gap-3">
                  <span className="text-[#8aca8a] font-semibold font-mono">01.</span>
                  <p>Human or AI writes code</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#8aca8a] font-semibold font-mono">02.</span>
                  <p>Run <code className="bg-[#080c08] border border-[#2a3a2a] px-2 py-1 rounded-sm text-sm text-[#8aca8a]">blocks run &lt;name&gt;</code></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#8aca8a] font-semibold font-mono">03.</span>
                  <p>Validators run—built-in or custom. Check types, structure, semantics, or <span className="text-[#8aca8a]">anything</span> (screenshots, contrast, performance, security...)</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#8aca8a] font-semibold font-mono">04.</span>
                  <p><span className="text-[#cadd6a]">Drift detected?</span> You decide: fix code or update spec</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#8aca8a] font-semibold font-mono">05.</span>
                  <p>Iterate until both code and spec align</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Feedback Loop Example */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-[#cadd6a] uppercase tracking-wide">
            The Feedback Loop in Action
          </h2>
          <p className="text-center text-[#6a8a6a] mb-12 max-w-2xl mx-auto">
            Watch how an AI agent uses Blocks to iterate until code meets your spec.
          </p>

          {/* Terminal conversation */}
          <div className="bg-[#0a120a] rounded-sm border border-[#3a5a3a] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {/* Terminal header */}
            <div className="px-4 py-3 bg-[#080c08] border-b border-[#2a3a2a] flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#aa4a4a]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#aa8a4a]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#4aaa4a]"></div>
              <span className="ml-3 text-[#5a8a5a] text-xs uppercase tracking-wider">AI Agent Session</span>
            </div>

            {/* Conversation */}
            <div className="p-6 space-y-6 text-sm">
              {/* User request */}
              <div>
                <div className="text-[#5a8a5a] text-xs uppercase tracking-wider mb-2">User</div>
                <div className="text-[#8a9a8a]">Add a new scorer module for the job recommendation engine that calculates location proximity score</div>
              </div>

              {/* AI writes code */}
              <div>
                <div className="text-[#5a8a5a] text-xs uppercase tracking-wider mb-2">Agent</div>
                <div className="text-[#8a9a8a] mb-3">I'll create a location scorer that calculates distance-based similarity.</div>
                <div className="bg-[#080c08] border border-[#2a3a2a] rounded-sm p-3 text-xs space-y-1">
                  <div><span className="text-[#5a8a5a]">Created:</span> <span className="text-[#8aca8a]">blocks/scorer-location/index.ts</span></div>
                  <div><span className="text-[#5a8a5a]">Created:</span> <span className="text-[#8aca8a]">blocks/scorer-location/scorer.ts</span></div>
                </div>
              </div>

              {/* AI runs validation */}
              <div>
                <div className="text-[#5a8a5a] text-xs uppercase tracking-wider mb-2">Agent runs validation</div>
                <div className="bg-[#080c08] border border-[#2a3a2a] rounded-sm p-3 font-mono text-xs">
                  <div className="text-[#6a8a6a]">$ blocks run scorer.location</div>
                  <div className="mt-2 text-[#4aaa4a]">✓ schema.io passed</div>
                  <div className="text-[#aa6a4a]">✗ domain.validation failed</div>
                  <div className="text-[#8a9a8a] ml-4">• Score output range is 0-100, should be normalized 0-1</div>
                  <div className="text-[#8a9a8a] ml-4">• Missing handling for remote jobs (should return 1.0)</div>
                  <div className="text-[#8a9a8a] ml-4">• Distance calculation doesn't account for "willing to relocate" flag</div>
                </div>
              </div>

              {/* AI fixes */}
              <div>
                <div className="text-[#5a8a5a] text-xs uppercase tracking-wider mb-2">Agent</div>
                <div className="text-[#8a9a8a] mb-3">The domain validator caught 3 issues with my scoring logic:</div>
                <div className="bg-[#080c08] border border-[#2a3a2a] rounded-sm p-3 text-xs space-y-1">
                  <div><span className="text-[#8aca8a]">1.</span> <span className="text-[#8a9a8a]">Normalized score output to 0-1 range</span></div>
                  <div><span className="text-[#8aca8a]">2.</span> <span className="text-[#8a9a8a]">Added remote job check → returns 1.0</span></div>
                  <div><span className="text-[#8aca8a]">3.</span> <span className="text-[#8a9a8a]">Added relocation flag handling → boosts score by 0.3</span></div>
                </div>
              </div>

              {/* AI runs validation again */}
              <div>
                <div className="text-[#5a8a5a] text-xs uppercase tracking-wider mb-2">Agent runs validation</div>
                <div className="bg-[#080c08] border border-[#2a3a2a] rounded-sm p-3 font-mono text-xs">
                  <div className="text-[#6a8a6a]">$ blocks run scorer.location</div>
                  <div className="mt-2 text-[#4aaa4a]">✓ schema.io passed</div>
                  <div className="text-[#4aaa4a]">✓ shape.exports.ts passed</div>
                  <div className="text-[#4aaa4a]">✓ domain.validation passed</div>
                  <div className="mt-2 text-[#cadd6a]">All validators passed</div>
                </div>
              </div>

              {/* Done */}
              <div>
                <div className="text-[#5a8a5a] text-xs uppercase tracking-wider mb-2">Agent</div>
                <div className="text-[#8aca8a]">Done. The location scorer is ready and integrates with the other scoring modules.</div>
              </div>
            </div>
          </div>

          <p className="text-center text-[#5a8a5a] mt-6 text-sm">
            The agent sees validation output, understands the issues, and fixes them autonomously.
          </p>
        </div>
      </div>

      {/* Multi-Layer Validation */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-[#cadd6a] uppercase tracking-wide">
            Multi-Layer Validation
          </h2>
          <p className="text-center text-[#6a8a6a] mb-12 max-w-2xl mx-auto">
            Catch issues at every level: from schema validation to semantic analysis with AI.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Schema Validation */}
            <div className="bg-[#0a120a] rounded-sm p-8 border border-[#2a3a2a] hover:border-[#5a8a5a] hover:shadow-[0_0_20px_rgba(138,202,138,0.1)] transition-all">
              <div className="w-12 h-12 bg-[#080c08] border border-[#3a5a3a] rounded-sm flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#8aca8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-[#8aca8a]">Schema</h3>
              <p className="text-[#6a8a6a] text-sm">
                Fast, deterministic validation of inputs, outputs, and data types using Zod schemas.
              </p>
            </div>

            {/* Shape Validation */}
            <div className="bg-[#0a120a] rounded-sm p-8 border border-[#2a3a2a] hover:border-[#5a8a5a] hover:shadow-[0_0_20px_rgba(138,202,138,0.1)] transition-all">
              <div className="w-12 h-12 bg-[#080c08] border border-[#3a5a3a] rounded-sm flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#8aca8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-[#8aca8a]">Shape</h3>
              <p className="text-[#6a8a6a] text-sm">
                Verify file structure, exports, and conventions to maintain consistent block organization.
              </p>
            </div>

            {/* Domain Validation */}
            <div className="bg-[#0a120a] rounded-sm p-8 border border-[#2a3a2a] hover:border-[#5a8a5a] hover:shadow-[0_0_20px_rgba(138,202,138,0.1)] transition-all">
              <div className="w-12 h-12 bg-[#080c08] border border-[#3a5a3a] rounded-sm flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#cadd6a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-[#8aca8a]">Domain</h3>
              <p className="text-[#6a8a6a] text-sm">
                AI-powered semantic analysis that understands your domain concepts and validates against them.
              </p>
            </div>
          </div>

          {/* Extensible Validators Note */}
          <div className="mt-12 bg-[#0a120a] rounded-sm p-8 border border-[#3a5a3a]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#080c08] border border-[#5a8a5a] rounded-sm flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(138,202,138,0.2)]">
                <svg className="w-5 h-5 text-[#cadd6a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-[#cadd6a]">Fully Extensible Validator System</h3>
                <p className="text-[#6a8a6a] mb-3">
                  <span className="text-[#8aca8a]">schema</span>, <span className="text-[#8aca8a]">shape</span>, and <span className="text-[#8aca8a]">domain</span> are just the built-in validators we recommend.
                  You can add any number of custom validators, override the defaults, or build your own validation pipeline.
                </p>
                <div className="bg-[#080c08] border border-[#2a3a2a] rounded-sm p-4 mt-4">
                  <code className="text-sm text-[#8a9a8a]">
                    <div className="text-[#4a6a4a]"># Mix built-in and custom validators</div>
                    <div className="mt-2">validators:</div>
                    <div className="ml-4">- <span className="text-[#8aca8a]">schema</span></div>
                    <div className="ml-4">- <span className="text-[#8aca8a]">domain</span></div>
                    <div className="ml-4">- name: <span className="text-[#cadd6a]">security_scan</span></div>
                    <div className="ml-6">run: <span className="text-[#cadd6a]">"security.audit"</span></div>
                    <div className="ml-4">- name: <span className="text-[#cadd6a]">perf_check</span></div>
                    <div className="ml-6">run: <span className="text-[#cadd6a]">"perf.benchmark"</span></div>
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Examples */}
      <div id="examples" className="bg-[#080c08] border-y border-[#2a3a2a] py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#cadd6a] uppercase tracking-wide">
                Live Examples
              </h2>
              <p className="text-[#6a8a6a] max-w-2xl mx-auto">
                Explore real-world examples built to discover what Blocks should be. Each example explores different domain patterns.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* JSON Resume Themes Example */}
              <div className="bg-[#0a120a] rounded-sm overflow-hidden border border-[#2a3a2a] hover:border-[#5a8a5a] hover:shadow-[0_0_20px_rgba(138,202,138,0.1)] transition-all">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#080c08] border border-[#3a5a3a] rounded-sm flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#8aca8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#8aca8a]">Resume Themes</h3>
                      <p className="text-xs text-[#5a8a5a] uppercase tracking-wider">Template Rendering</p>
                    </div>
                  </div>
                  <p className="text-[#6a8a6a] text-sm mb-4">
                    Validates resume themes for semantic HTML, accessibility, and responsive design using DRY domain rules.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-[#080c08] border border-[#2a3a2a] text-[#5a8a5a] rounded-sm text-xs uppercase">Handlebars</span>
                    <span className="px-2 py-1 bg-[#080c08] border border-[#2a3a2a] text-[#5a8a5a] rounded-sm text-xs uppercase">WCAG</span>
                  </div>
                  <Link
                    href="/docs/examples/json-resume-themes"
                    className="inline-flex items-center gap-2 text-[#8aca8a] hover:text-[#cadd6a] transition-colors text-sm"
                  >
                    View Example
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Blog Content Validator Example */}
              <div className="bg-[#0a120a] rounded-sm overflow-hidden border border-[#2a3a2a] hover:border-[#5a8a5a] hover:shadow-[0_0_20px_rgba(138,202,138,0.1)] transition-all">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#080c08] border border-[#3a5a3a] rounded-sm flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#cadd6a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#8aca8a]">Blog Validator</h3>
                      <p className="text-xs text-[#5a8a5a] uppercase tracking-wider">Content Quality</p>
                    </div>
                  </div>
                  <p className="text-[#6a8a6a] text-sm mb-4">
                    Validates markdown posts for humor and conversational tone using AI-powered semantic analysis.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-[#080c08] border border-[#2a3a2a] text-[#5a8a5a] rounded-sm text-xs uppercase">Markdown</span>
                    <span className="px-2 py-1 bg-[#080c08] border border-[#2a3a2a] text-[#5a8a5a] rounded-sm text-xs uppercase">Tone Analysis</span>
                  </div>
                  <Link
                    href="/docs/examples/blog-content-validator"
                    className="inline-flex items-center gap-2 text-[#8aca8a] hover:text-[#cadd6a] transition-colors text-sm"
                  >
                    View Example
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* HR Recommendation Engine Example */}
              <div className="bg-[#0a120a] rounded-sm overflow-hidden border border-[#2a3a2a] hover:border-[#5a8a5a] hover:shadow-[0_0_20px_rgba(138,202,138,0.1)] transition-all">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#080c08] border border-[#3a5a3a] rounded-sm flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#8aca8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#8aca8a]">HR Engine</h3>
                      <p className="text-xs text-[#5a8a5a] uppercase tracking-wider">Production-Ready</p>
                    </div>
                  </div>
                  <p className="text-[#6a8a6a] text-sm mb-4">
                    Complete recommendation system with scoring, ranking, and filtering. Shows multi-block composition.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-[#080c08] border border-[#2a3a2a] text-[#5a8a5a] rounded-sm text-xs uppercase">Scoring</span>
                    <span className="px-2 py-1 bg-[#080c08] border border-[#2a3a2a] text-[#5a8a5a] rounded-sm text-xs uppercase">Ranking</span>
                  </div>
                  <Link
                    href="/docs/examples/hr-recommendation-engine"
                    className="inline-flex items-center gap-2 text-[#8aca8a] hover:text-[#cadd6a] transition-colors text-sm"
                  >
                    View Example
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-[#6a8a6a] mb-4">
                Each example helped shape the Blocks specification through practical discovery.
              </p>
              <Link
                href="/docs/examples"
                className="inline-flex items-center gap-2 text-[#8aca8a] hover:text-[#cadd6a] transition-colors"
              >
                Explore All Examples
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#cadd6a] uppercase tracking-wide">
            Ready to Add Guardrails to Your AI Codebase?
          </h2>
          <p className="text-[#6a8a6a] mb-8 max-w-2xl mx-auto">
            Create a feedback loop where AI agents run validation until all code aligns with your domain requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/getting-started"
              className={getButtonClassName("primary", "lg")}
            >
              Get Started
            </Link>
            <Link
              href="https://github.com/thomasdavis/blocks"
              className={getButtonClassName("outline", "lg")}
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#2a3a2a] bg-[#080c08] py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[#5a8a5a] text-sm">
            <div className="w-2 h-2 rounded-full bg-[#5a8a5a] animate-pulse" />
            <span className="uppercase tracking-wider">Terminal Blueprint Theme</span>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
