"use client";

import Link from "next/link";
import { authClient } from "../../lib/auth-client";

export function NavAuth() {
  const session = authClient.useSession();

  if (session.isPending) {
    return <div className="ml-2 w-16 h-7" />;
  }

  if (session.data) {
    return (
      <div className="ml-2 flex items-center gap-2">
        <span className="text-xs text-[#506450] dark:text-[#5a8a5a] truncate max-w-[140px]">
          {session.data.user.email}
        </span>
        <button
          onClick={() => authClient.signOut()}
          className="px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider text-[#506450] dark:text-[#5a8a5a] hover:text-[#3c783c] dark:hover:text-[#8aca8a] hover:bg-[#f5faf5]/50 dark:hover:bg-[#0a120a]/50 transition-all duration-150 border border-[#c8dcc8] dark:border-[#2a3a2a]"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/sign-in"
      className="ml-2 px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider text-[#506450] dark:text-[#5a8a5a] hover:text-[#3c783c] dark:hover:text-[#8aca8a] hover:bg-[#f5faf5]/50 dark:hover:bg-[#0a120a]/50 transition-all duration-150 border border-[#c8dcc8] dark:border-[#2a3a2a]"
    >
      Sign In
    </Link>
  );
}
