import Link from 'next/link';
import { Nav } from '../components/nav';
import { Footer } from '../components/footer';
import { TerminalSession } from './terminal-session';
import { getButtonClassName } from '@blocksai/ui/button';

export const metadata = {
  title: 'Example | Blocks',
  description: 'Watch an AI agent use Blocks to validate and fix code',
};

export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-[#fafcfa] dark:bg-[#050805] text-[#1e281e] dark:text-[#a0b0a0] font-mono">
      {/* Scanline overlay effect - only in dark mode */}
      <div
        className="fixed inset-0 pointer-events-none z-40 opacity-0 dark:opacity-[0.015]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)",
        }}
      />

      <Nav />

      <main id="main-content" className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-[#3c783c] dark:text-[#8aca8a] uppercase">
              Example Session
            </h1>
            <p className="text-lg text-[#506450] dark:text-[#6a8a6a] max-w-2xl mx-auto">
              Watch how an AI agent uses Blocks to validate code against domain rules,
              catch issues, and fix them automatically.
            </p>
          </div>

          {/* Terminal Demo */}
          <div className="max-w-4xl mx-auto mb-16">
            <TerminalSession />
          </div>

          {/* What's Happening Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8 text-[#8cb43c] dark:text-[#cadd6a] uppercase tracking-wide">
              What's Happening Here?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#f5faf5] dark:bg-[#0a120a] rounded-sm p-6 border border-[#c8dcc8] dark:border-[#2a3a2a] hover:border-[#a0c0a0] dark:hover:border-[#3a5a3a] transition-colors">
                <div className="w-12 h-12 bg-[#ebf5eb] dark:bg-[#080c08] border border-[#a0c0a0] dark:border-[#3a5a3a] rounded-sm flex items-center justify-center mb-4">
                  <span className="text-[#3c783c] dark:text-[#8aca8a] text-xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold text-[#3c783c] dark:text-[#8aca8a] mb-2">User Request</h3>
                <p className="text-[#506450] dark:text-[#6a8a6a] text-sm">
                  You describe what you want in natural language. The AI agent writes the implementation.
                </p>
              </div>

              <div className="bg-[#f5faf5] dark:bg-[#0a120a] rounded-sm p-6 border border-[#c8dcc8] dark:border-[#2a3a2a] hover:border-[#a0c0a0] dark:hover:border-[#3a5a3a] transition-colors">
                <div className="w-12 h-12 bg-[#ebf5eb] dark:bg-[#080c08] border border-[#a0c0a0] dark:border-[#3a5a3a] rounded-sm flex items-center justify-center mb-4">
                  <span className="text-[#3c783c] dark:text-[#8aca8a] text-xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-[#3c783c] dark:text-[#8aca8a] mb-2">Blocks Validates</h3>
                <p className="text-[#506450] dark:text-[#6a8a6a] text-sm">
                  The agent runs <code className="text-[#3c783c] dark:text-[#8aca8a] bg-[#ebf5eb] dark:bg-[#080c08] px-1 rounded-sm">blocks run</code> to check against your domain rules.
                </p>
              </div>

              <div className="bg-[#f5faf5] dark:bg-[#0a120a] rounded-sm p-6 border border-[#c8dcc8] dark:border-[#2a3a2a] hover:border-[#a0c0a0] dark:hover:border-[#3a5a3a] transition-colors">
                <div className="w-12 h-12 bg-[#ebf5eb] dark:bg-[#080c08] border border-[#a0c0a0] dark:border-[#3a5a3a] rounded-sm flex items-center justify-center mb-4">
                  <span className="text-[#8cb43c] dark:text-[#cadd6a] text-xl font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold text-[#3c783c] dark:text-[#8aca8a] mb-2">Iterate to Success</h3>
                <p className="text-[#506450] dark:text-[#6a8a6a] text-sm">
                  The agent reads validation output, understands the issues, fixes them, and repeats until passing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insight Section */}
        <div className="bg-[#ebf5eb] dark:bg-[#080c08] border-y border-[#c8dcc8] dark:border-[#2a3a2a] py-16 mt-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-[#8cb43c] dark:text-[#cadd6a] mb-4 uppercase tracking-wide">
                The Key Insight
              </h2>
              <p className="text-[#506450] dark:text-[#6a8a6a] text-lg mb-6">
                AI agents can read validation output just like humans. When Blocks reports issues,
                the AI understands <em>why</em> the code doesn't meet the spec and knows how to fix it.
              </p>
              <div className="bg-[#f5faf5] dark:bg-[#0a120a] border border-[#a0c0a0] dark:border-[#3a5a3a] rounded-sm p-6 text-left">
                <div className="text-[#3c783c] dark:text-[#8aca8a] font-mono text-sm mb-2 uppercase tracking-wider">The Feedback Loop:</div>
                <div className="space-y-2 text-[#506450] dark:text-[#8a9a8a] font-mono text-sm">
                  <div><span className="text-[#3c783c] dark:text-[#8aca8a] font-semibold">01.</span> AI writes code</div>
                  <div><span className="text-[#3c783c] dark:text-[#8aca8a] font-semibold">02.</span> <span className="text-[#3c783c] dark:text-[#8aca8a]">blocks run</span> validates against domain rules</div>
                  <div><span className="text-[#3c783c] dark:text-[#8aca8a] font-semibold">03.</span> AI reads output → understands issues</div>
                  <div><span className="text-[#3c783c] dark:text-[#8aca8a] font-semibold">04.</span> AI fixes code → runs validation again</div>
                  <div><span className="text-[#3c783c] dark:text-[#8aca8a] font-semibold">05.</span> Repeat until <span className="text-[#8cb43c] dark:text-[#cadd6a]">all validators pass</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-[#8cb43c] dark:text-[#cadd6a] mb-4 uppercase tracking-wide">
              Ready to Try It?
            </h2>
            <p className="text-[#506450] dark:text-[#6a8a6a] mb-8">
              Add domain-aware validation to your AI coding workflow in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/getting-started"
                className={getButtonClassName("primary", "lg")}
              >
                Get Started
              </Link>
              <Link
                href="/docs"
                className={getButtonClassName("outline", "lg")}
              >
                Read the Docs
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
