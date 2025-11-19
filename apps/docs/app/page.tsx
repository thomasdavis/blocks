import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Build with Confidence
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Domain-driven validation framework that catches semantic issues before they reach production.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/docs/examples"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              View Examples
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
{`domain:
  entities:
    - name: resume
      description: "JSON Resume schema"

  signals:
    - name: readability
      description: "Clear visual hierarchy"

  measures:
    - name: semantic_html
      description: "Proper HTML5 structure"

blocks:
  theme.modern_professional:
    type: template
    description: "Professional resume theme"
    outputs:
      - name: html
        measures: [semantic_html]

validators:
  domain:
    - run: "domain.semantics.v1"`}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Features Grid */}
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

      {/* Key Features */}
      <div className="bg-slate-50 dark:bg-slate-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why Blocks?
            </h2>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  Development-Time Validation
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Catch issues during development, not at runtime. Validate source code with AI before deployment for zero runtime overhead.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Domain-Driven Design
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Define entities, signals, and measures that represent your domain. Validators understand your business logic.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">🔄</span>
                  Iterative Improvement
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Get actionable feedback from validators. Fix issues, re-run validation, and iterate until perfect.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  AI-Powered Insights
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Leverage GPT-4 for semantic analysis that goes beyond syntax. Understand intent, not just structure.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">📦</span>
                  Flexible Structure
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Organize projects your way. Use the path field to respect your existing folder structure.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">🔧</span>
                  Composable Blocks
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Build small, focused blocks that do one thing well. Compose them into powerful workflows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Better Software?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Get started with Blocks in minutes. Follow our comprehensive guide.
          </p>
          <Link
            href="/docs/getting-started/installation"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Read the Docs
          </Link>
        </div>
      </div>
    </main>
  );
}
