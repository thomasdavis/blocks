import Link from "next/link";
import { Nav } from "../components/nav";
import { Footer } from "../components/footer";
import { getButtonClassName } from "@blocksai/ui/button";
import { RegistryContent } from "./registry-content";

export default function RegistryPage() {
  return (
    <div className="min-h-screen bg-[#fafcfa] dark:bg-[#050805] text-[#1e281e] dark:text-[#a0b0a0] font-mono">
      <div
        className="fixed inset-0 pointer-events-none z-40 opacity-0 dark:opacity-[0.015]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)",
        }}
      />

      <Nav />

      <main id="main-content" className="relative z-10">
        {/* Hero */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-block bg-[#ebf5eb] dark:bg-[#080c08] border border-[#a0c0a0] dark:border-[#3a5a3a] rounded-sm px-3 py-1 text-xs uppercase tracking-widest text-[#3c783c] dark:text-[#8aca8a] mb-6">
              Powered by Turso
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-[#3c783c] dark:text-[#8aca8a] uppercase">
              Block Registry
            </h1>
            <p className="text-lg text-[#506450] dark:text-[#6a8a6a] max-w-2xl mx-auto mb-8">
              Official shared domain specifications, entities, semantics, and
              example blocks. Pull them into any project via{" "}
              <code className="text-[#3c783c] dark:text-[#8aca8a] bg-[#ebf5eb] dark:bg-[#080c08] px-1.5 py-0.5 rounded-sm text-sm">
                sources:
              </code>{" "}
              in your blocks.yml.
            </p>
            <div className="bg-[#f5faf5] dark:bg-[#0a120a] border border-[#a0c0a0] dark:border-[#3a5a3a] rounded-sm p-4 max-w-lg mx-auto text-left mb-6">
              <div className="text-[10px] uppercase tracking-widest text-[#708070] dark:text-[#5a8a5a] mb-2">
                Connect to this registry
              </div>
              <code className="text-sm text-[#3c783c] dark:text-[#8aca8a] break-all">
                libsql://blocksai-thomasdavis.aws-ap-northeast-1.turso.io
              </code>
            </div>
            <Link
              href="/registry/submit"
              className={getButtonClassName("primary", "lg")}
            >
              Submit a Block
            </Link>
          </div>
        </div>

        {/* Registry data */}
        <RegistryContent />

        {/* CTA */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-[#8cb43c] dark:text-[#cadd6a] mb-4 uppercase tracking-wide">
              Use the Registry
            </h2>
            <p className="text-[#506450] dark:text-[#6a8a6a] mb-4 text-sm">
              Add this to your blocks.yml to pull shared specs:
            </p>
            <div className="bg-[#f5faf5] dark:bg-[#0a120a] border border-[#a0c0a0] dark:border-[#3a5a3a] rounded-sm p-4 max-w-lg mx-auto text-left mb-8">
              <pre className="text-sm text-[#506450] dark:text-[#8a9a8a] whitespace-pre-wrap">
{`sources:
  - type: database
    url: "libsql://blocksai-thomasdavis\\
          .aws-ap-northeast-1.turso.io"`}
              </pre>
            </div>
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
