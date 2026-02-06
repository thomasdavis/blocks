"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "../../../lib/auth-client";

export function SubmitForm() {
  const router = useRouter();
  const session = authClient.useSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inputs, setInputs] = useState("");
  const [outputs, setOutputs] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session.isPending && !session.data) {
      router.push("/sign-in");
    }
  }, [session.isPending, session.data, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let parsedInputs = null;
      let parsedOutputs = null;

      if (inputs.trim()) {
        try {
          parsedInputs = JSON.parse(inputs);
        } catch {
          setError("Inputs must be valid JSON");
          setLoading(false);
          return;
        }
      }

      if (outputs.trim()) {
        try {
          parsedOutputs = JSON.parse(outputs);
        } catch {
          setError("Outputs must be valid JSON");
          setLoading(false);
          return;
        }
      }

      const res = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          inputs: parsedInputs,
          outputs: parsedOutputs,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit block");
        setLoading(false);
        return;
      }

      router.push("/registry");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (session.isPending) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <div className="h-8 bg-[#f5faf5] dark:bg-[#0a120a] rounded-sm animate-pulse" />
      </div>
    );
  }

  if (!session.data) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/registry"
          className="text-xs text-[#708070] dark:text-[#5a8a5a] hover:text-[#3c783c] dark:hover:text-[#8aca8a] transition-colors"
        >
          &larr; Back to Registry
        </Link>
      </div>

      <div className="text-center mb-8">
        <div className="inline-block bg-[#ebf5eb] dark:bg-[#080c08] border border-[#a0c0a0] dark:border-[#3a5a3a] rounded-sm px-3 py-1 text-xs uppercase tracking-widest text-[#3c783c] dark:text-[#8aca8a] mb-6">
          Submit
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#3c783c] dark:text-[#8aca8a] uppercase mb-2">
          Submit a Block
        </h1>
        <p className="text-sm text-[#506450] dark:text-[#6a8a6a]">
          Share a block definition with the community.
        </p>
      </div>

      <div className="bg-[#f5faf5] dark:bg-[#0a120a] border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-[10px] uppercase tracking-widest text-[#708070] dark:text-[#5a8a5a] mb-2"
            >
              Block Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. theme.minimal"
              className="w-full px-4 py-3 bg-[#fafcfa] dark:bg-[#050805] border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm text-sm text-[#1e281e] dark:text-[#a0b0a0] placeholder:text-[#a0b0a0] dark:placeholder:text-[#3a5a3a] focus:outline-none focus:border-[#3c783c] dark:focus:border-[#8aca8a] focus:ring-1 focus:ring-[#3c783c] dark:focus:ring-[#8aca8a] transition-colors font-mono"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-[10px] uppercase tracking-widest text-[#708070] dark:text-[#5a8a5a] mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this block does..."
              rows={3}
              className="w-full px-4 py-3 bg-[#fafcfa] dark:bg-[#050805] border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm text-sm text-[#1e281e] dark:text-[#a0b0a0] placeholder:text-[#a0b0a0] dark:placeholder:text-[#3a5a3a] focus:outline-none focus:border-[#3c783c] dark:focus:border-[#8aca8a] focus:ring-1 focus:ring-[#3c783c] dark:focus:ring-[#8aca8a] transition-colors font-mono resize-vertical"
            />
          </div>

          <div>
            <label
              htmlFor="inputs"
              className="block text-[10px] uppercase tracking-widest text-[#708070] dark:text-[#5a8a5a] mb-2"
            >
              Inputs (JSON, optional)
            </label>
            <textarea
              id="inputs"
              value={inputs}
              onChange={(e) => setInputs(e.target.value)}
              placeholder={`[{"name": "data", "type": "object"}]`}
              rows={3}
              className="w-full px-4 py-3 bg-[#fafcfa] dark:bg-[#050805] border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm text-sm text-[#1e281e] dark:text-[#a0b0a0] placeholder:text-[#a0b0a0] dark:placeholder:text-[#3a5a3a] focus:outline-none focus:border-[#3c783c] dark:focus:border-[#8aca8a] focus:ring-1 focus:ring-[#3c783c] dark:focus:ring-[#8aca8a] transition-colors font-mono resize-vertical"
            />
          </div>

          <div>
            <label
              htmlFor="outputs"
              className="block text-[10px] uppercase tracking-widest text-[#708070] dark:text-[#5a8a5a] mb-2"
            >
              Outputs (JSON, optional)
            </label>
            <textarea
              id="outputs"
              value={outputs}
              onChange={(e) => setOutputs(e.target.value)}
              placeholder={`[{"name": "html", "type": "string"}]`}
              rows={3}
              className="w-full px-4 py-3 bg-[#fafcfa] dark:bg-[#050805] border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm text-sm text-[#1e281e] dark:text-[#a0b0a0] placeholder:text-[#a0b0a0] dark:placeholder:text-[#3a5a3a] focus:outline-none focus:border-[#3c783c] dark:focus:border-[#8aca8a] focus:ring-1 focus:ring-[#3c783c] dark:focus:ring-[#8aca8a] transition-colors font-mono resize-vertical"
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
            {loading ? "Submitting..." : "Submit Block"}
          </button>
        </form>
      </div>
    </div>
  );
}
