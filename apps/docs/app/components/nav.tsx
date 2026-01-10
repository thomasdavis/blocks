"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/getting-started", label: "Get Started" },
  { href: "/architecture", label: "Architecture" },
  { href: "/docs/devtools", label: "Devtools" },
  { href: "/changelog", label: "Changelog" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#2a3a2a] bg-[#050805]/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-mono font-bold text-xl text-[#8aca8a]"
          >
            <div className="w-8 h-8 rounded-sm bg-[#0a120a] border border-[#5a8a5a] flex items-center justify-center shadow-[0_0_10px_rgba(138,202,138,0.2)]">
              <span className="text-[#cadd6a] text-sm font-bold">B</span>
            </div>
            <span className="tracking-wide">Blocks</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-sm text-sm font-mono uppercase tracking-wider transition-all duration-150 ${
                    isActive
                      ? "bg-[#0a120a] border border-[#3a5a3a] text-[#cadd6a] shadow-[0_0_8px_rgba(138,202,138,0.15)]"
                      : "text-[#5a8a5a] hover:text-[#8aca8a] hover:bg-[#0a120a]/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href="https://github.com/anthropics/blocks"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 p-2 rounded-sm text-[#5a8a5a] hover:text-[#8aca8a] hover:bg-[#0a120a]/50 transition-all duration-150"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
