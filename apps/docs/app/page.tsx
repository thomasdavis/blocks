import Link from 'next/link';
import { CopyButton } from './copy-button';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Discovery Phase Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5 border-b border-blue-200 dark:border-blue-900">
        <div className="container mx-auto px-4 py-3">
          <p className="text-center text-sm text-slate-700 dark:text-slate-300">
            🔬 <span className="font-semibold">Discovery Phase:</span> We're exploring what Blocks should be through practical examples.
            <Link href="/docs/getting-started" className="ml-2 underline hover:text-blue-600 dark:hover:text-blue-400">
              Learn more →
            </Link>
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Human-AI Collaboration
            <br />
            with Guardrails
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-3xl mx-auto">
            A <strong>negotiation layer</strong> for human-AI collaboration.
            Both humans and AI write code freely—Blocks validates the result and reports drift,
            helping you decide whether to fix code or update the spec.
          </p>

          {/* Quick Start */}
          <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-6 mb-8 max-w-2xl mx-auto border border-slate-800">
            <p className="text-slate-400 text-sm mb-3">Get started in seconds:</p>
            <div className="bg-slate-800 rounded px-4 py-3 font-mono text-sm text-left text-slate-200 flex items-center justify-between">
              <code>npm install -g @blocksai/cli</code>
              <CopyButton text="npm install -g @blocksai/cli" />
            </div>
            <div className="mt-3 bg-slate-800 rounded px-4 py-3 font-mono text-sm text-left text-slate-200">
              <code>blocks run my-block</code>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-500/30"
            >
              Get Started
            </Link>
            <Link
              href="#examples"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              View Live Examples
            </Link>
            <Link
              href="/changelog"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Changelog
            </Link>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-slate-900 dark:bg-slate-950 rounded-xl shadow-2xl overflow-hidden border border-slate-800">
            <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-3 text-slate-400 text-sm">blocks.yml</span>
              </div>
            </div>
            <pre className="p-6 overflow-x-auto text-sm">
              <code className="text-slate-300">
{`philosophy:
  - "Blog posts must include humor and conversational tone"
  - "Resume themes must prioritize readability"

blocks:
  # Default domain rules for ALL blocks
  domain_rules:
    - id: humor_required
      description: "Must include wit or light-hearted commentary"

  validator.blog_post:
    description: "Validates blog content"
    # Inherits domain_rules automatically

validators:
  domain:
    - run: "domain.validation.v1"  # AI-powered`}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Human-AI Collaboration */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Not Locking Down Code—Giving You a Semantic Compass
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Blocks doesn't restrict who can edit code. Instead, it detects when either humans or AI introduce drift from the spec.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="text-lg font-semibold mb-2">Humans Write Code</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  You're free to modify any block. Write, refactor, experiment—Blocks won't stop you.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="text-lg font-semibold mb-2">AI Agents Write Code</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Claude Code (and other AI assistants) can modify blocks too. No restrictions.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="text-lg font-semibold mb-2">Blocks Detects Drift</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Run validation. Blocks reports drift and helps you decide: fix code or update spec.
                </p>
              </div>
            </div>

            <div className="mt-12 bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold mb-4">The Validation Loop</h3>
              <div className="space-y-3 text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">1.</span>
                  <p>Human or AI writes code</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">2.</span>
                  <p>Run <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-sm">blocks run &lt;name&gt;</code></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">3.</span>
                  <p>Blocks validates: schema (types), shape (structure), domain (semantics)</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">4.</span>
                  <p><strong>Drift detected?</strong> You decide: fix code or update spec</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">5.</span>
                  <p>Iterate until both code and spec align</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Layer Validation */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Multi-Layer Validation
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
            Catch issues at every level: from schema validation to semantic analysis with AI.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Schema Validation */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Schema</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Fast, deterministic validation of inputs, outputs, and data types using Zod schemas.
              </p>
            </div>

            {/* Shape Validation */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Shape</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Verify file structure, exports, and conventions to maintain consistent block organization.
              </p>
            </div>

            {/* Domain Validation */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Domain</h3>
              <p className="text-slate-600 dark:text-slate-400">
                AI-powered semantic analysis that understands your domain concepts and validates against them.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Examples */}
      <div id="examples" className="bg-slate-50 dark:bg-slate-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Live Examples
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Explore real-world examples built to discover what Blocks should be. Each example explores different domain patterns.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Resume Themes Example */}
              <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">JSON Resume Themes</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Template Rendering</p>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Validates resume themes for semantic HTML, accessibility, and responsive design. Shows how domain rules eliminate duplication across themes.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">Handlebars</span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">Semantic HTML</span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">WCAG</span>
                  </div>
                  <Link
                    href="/docs/examples/json-resume-themes"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    View Example
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Blog Validator Example */}
              <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Blog Content Validator</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Content Quality</p>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Validates markdown blog posts for humor and conversational tone. Demonstrates file-based inputs and domain constraints for subjective quality.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">Markdown</span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">Humor Detection</span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">Tone Analysis</span>
                  </div>
                  <Link
                    href="/docs/examples/blog-content-validator"
                    className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline font-medium"
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
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Both examples helped shape the Blocks specification through practical discovery.
              </p>
              <Link
                href="/docs/examples"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Explore Blocks?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Join the discovery phase. Build examples, shape the spec, and help define what Blocks becomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs/getting-started/installation"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-500/30"
            >
              Get Started
            </Link>
            <Link
              href="https://github.com/anthropics/blocks"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
