"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--ui-border)] bg-[var(--ui-background)]">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              B
            </div>
            <span className="text-lg font-semibold">Blocks Devtools</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
