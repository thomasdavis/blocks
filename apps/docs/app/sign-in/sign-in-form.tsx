"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "../../lib/auth-client";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await authClient.signIn.magicLink({
        email,
        callbackURL: "/registry",
      });

      if (authError) {
        setError(authError.message ?? "Failed to send magic link");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-block bg-[#ebf5eb] dark:bg-[#080c08] border border-[#a0c0a0] dark:border-[#3a5a3a] rounded-sm px-3 py-1 text-xs uppercase tracking-widest text-[#3c783c] dark:text-[#8aca8a] mb-6">
          Authentication
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#3c783c] dark:text-[#8aca8a] uppercase mb-2">
          Sign In
        </h1>
        <p className="text-sm text-[#506450] dark:text-[#6a8a6a]">
          Sign in with a magic link sent to your email.
        </p>
      </div>

      <div className="bg-[#f5faf5] dark:bg-[#0a120a] border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm p-8">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-sm bg-[#ebf5eb] dark:bg-[#080c08] border border-[#a0c0a0] dark:border-[#3a5a3a] flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#3c783c] dark:text-[#8aca8a]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#3c783c] dark:text-[#8aca8a] uppercase">
              Check your inbox
            </h2>
            <p className="text-sm text-[#506450] dark:text-[#6a8a6a]">
              We sent a sign-in link to{" "}
              <span className="text-[#3c783c] dark:text-[#8aca8a] font-bold">
                {email}
              </span>
            </p>
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="text-xs text-[#708070] dark:text-[#5a8a5a] hover:text-[#3c783c] dark:hover:text-[#8aca8a] underline underline-offset-4 transition-colors"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-[10px] uppercase tracking-widest text-[#708070] dark:text-[#5a8a5a] mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-[#fafcfa] dark:bg-[#050805] border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm text-sm text-[#1e281e] dark:text-[#a0b0a0] placeholder:text-[#a0b0a0] dark:placeholder:text-[#3a5a3a] focus:outline-none focus:border-[#3c783c] dark:focus:border-[#8aca8a] focus:ring-1 focus:ring-[#3c783c] dark:focus:ring-[#8aca8a] transition-colors font-mono"
              />
            </div>

            {error && (
              <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-sm px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-[#3c783c] dark:bg-[#8aca8a] text-white dark:text-[#050805] rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-[#2d5c2d] dark:hover:bg-[#6aaa6a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
        )}
      </div>

      <div className="text-center mt-6">
        <Link
          href="/"
          className="text-xs text-[#708070] dark:text-[#5a8a5a] hover:text-[#3c783c] dark:hover:text-[#8aca8a] transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
