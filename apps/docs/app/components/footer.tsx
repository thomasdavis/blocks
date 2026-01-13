import Link from "next/link";

const footerLinks = {
  product: [
    { href: "/getting-started", label: "Get Started" },
    { href: "/architecture", label: "Architecture" },
    { href: "/docs/devtools", label: "Devtools" },
    { href: "/changelog", label: "Changelog" },
  ],
  resources: [
    { href: "/docs/examples", label: "Examples" },
    { href: "/docs/specification", label: "Specification" },
    { href: "/docs/tutorials", label: "Tutorials" },
  ],
  community: [
    { href: "https://github.com/thomasdavis/blocks", label: "GitHub", external: true },
    { href: "https://www.npmjs.com/org/blocksai", label: "NPM", external: true },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[#c8dcc8] dark:border-[#2a3a2a] bg-[#ebf5eb] dark:bg-[#080c08]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-mono font-bold text-lg text-[#3c783c] dark:text-[#8aca8a] mb-3"
            >
              <div className="w-7 h-7 rounded-sm bg-[#f5faf5] dark:bg-[#0a120a] border border-[#a0c0a0] dark:border-[#5a8a5a] flex items-center justify-center">
                <span className="text-[#8cb43c] dark:text-[#cadd6a] text-xs font-bold">B</span>
              </div>
              <span className="tracking-wide">Blocks</span>
            </Link>
            <p className="text-[#506450] dark:text-[#6a8a6a] text-sm">
              Guardrails for agentic code generation
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#3c783c] dark:text-[#8aca8a] mb-3">
              Product
            </h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#506450] dark:text-[#6a8a6a] hover:text-[#3c783c] dark:hover:text-[#8aca8a] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#3c783c] dark:text-[#8aca8a] mb-3">
              Resources
            </h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#506450] dark:text-[#6a8a6a] hover:text-[#3c783c] dark:hover:text-[#8aca8a] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#3c783c] dark:text-[#8aca8a] mb-3">
              Community
            </h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#506450] dark:text-[#6a8a6a] hover:text-[#3c783c] dark:hover:text-[#8aca8a] text-sm transition-colors inline-flex items-center gap-1"
                  >
                    {link.label}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#c8dcc8] dark:border-[#2a3a2a] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#708070] dark:text-[#5a8a5a] text-sm">
            <div className="w-2 h-2 rounded-full bg-[#3c783c] dark:bg-[#5a8a5a] animate-pulse" />
            <span className="uppercase tracking-wider font-mono">Terminal Blueprint Theme</span>
          </div>
          <p className="text-[#708070] dark:text-[#5a8a5a] text-xs">
            Open source under MIT License
          </p>
        </div>
      </div>
    </footer>
  );
}
