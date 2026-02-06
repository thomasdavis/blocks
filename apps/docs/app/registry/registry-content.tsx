"use client";

import { useEffect, useState } from "react";

interface BlockDef {
  description: string;
  inputs?: Array<{ name: string; type: string; optional?: boolean }>;
  outputs?: Array<{
    name: string;
    type: string;
    semantics?: string[];
    constraints?: string[];
  }>;
}

interface RegistryData {
  name: string;
  blocks: Record<string, BlockDef>;
  domain?: {
    entities?: Record<string, { fields: string[]; optional?: string[] }>;
    semantics?: Record<string, { description: string; extraction_hint?: string }>;
  };
  philosophy?: string[];
  validators?: any[];
}

// Block type → color coding
function getBlockBadge(name: string) {
  if (name.startsWith("theme."))
    return { label: "Theme", color: "text-[#9b59b6] bg-[#f0e6f6] dark:bg-[#1a0f1f] dark:text-[#c39bd3] border-[#d2b4de] dark:border-[#4a2060]" };
  if (name.startsWith("validator."))
    return { label: "Validator", color: "text-[#e67e22] bg-[#fef3e6] dark:bg-[#1f1408] dark:text-[#f0b27a] border-[#f0c987] dark:border-[#5a3810]" };
  if (name.startsWith("endpoint."))
    return { label: "Endpoint", color: "text-[#3498db] bg-[#eaf2f8] dark:bg-[#081420] dark:text-[#85c1e9] border-[#a9cce3] dark:border-[#1a4060]" };
  if (name.startsWith("template."))
    return { label: "Template", color: "text-[#1abc9c] bg-[#e8f8f5] dark:bg-[#081f1a] dark:text-[#76d7c4] border-[#a3e4d7] dark:border-[#145040]" };
  if (name.startsWith("adapter."))
    return { label: "Adapter", color: "text-[#e74c3c] bg-[#fdedec] dark:bg-[#1f0808] dark:text-[#f1948a] border-[#f5b7b1] dark:border-[#5a1414]" };
  return { label: "Block", color: "text-[#3c783c] bg-[#ebf5eb] dark:bg-[#080c08] dark:text-[#8aca8a] border-[#a0c0a0] dark:border-[#3a5a3a]" };
}

export function RegistryContent() {
  const [data, setData] = useState<RegistryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"blocks" | "entities" | "semantics">("blocks");

  useEffect(() => {
    fetch("/api/registry")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-[#f5faf5] dark:bg-[#0a120a] border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm p-8">
            <p className="text-[#708070] dark:text-[#5a8a5a]">
              Failed to load registry: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-[#f5faf5] dark:bg-[#0a120a] rounded-sm animate-pulse border border-[#c8dcc8] dark:border-[#2a3a2a]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const blocks = Object.entries(data.blocks);
  const entities = Object.entries(data.domain?.entities || {});
  const semantics = Object.entries(data.domain?.semantics || {});

  return (
    <>
      {/* Philosophy */}
      {data.philosophy && data.philosophy.length > 0 && (
        <div className="bg-[#ebf5eb] dark:bg-[#080c08] border-y border-[#c8dcc8] dark:border-[#2a3a2a] py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-bold text-[#8cb43c] dark:text-[#cadd6a] uppercase tracking-wide mb-6 text-center">
                Philosophy
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {data.philosophy.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-[#f5faf5] dark:bg-[#0a120a] border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm p-4"
                  >
                    <span className="text-[#8cb43c] dark:text-[#cadd6a] font-bold text-sm shrink-0">
                      {String(i + 1).padStart(2, "0")}.
                    </span>
                    <span className="text-sm text-[#506450] dark:text-[#6a8a6a]">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Blocks", count: blocks.length },
              { label: "Entities", count: entities.length },
              { label: "Semantics", count: semantics.length },
            ].map(({ label, count }) => (
              <div
                key={label}
                className="text-center bg-[#f5faf5] dark:bg-[#0a120a] border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm p-4"
              >
                <div className="text-3xl font-bold text-[#3c783c] dark:text-[#8aca8a]">
                  {count}
                </div>
                <div className="text-xs uppercase tracking-widest text-[#708070] dark:text-[#5a8a5a]">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-[#ebf5eb] dark:bg-[#080c08] rounded-sm p-1 border border-[#c8dcc8] dark:border-[#2a3a2a]">
            {(["blocks", "entities", "semantics"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-sm uppercase tracking-wide rounded-sm transition-colors ${
                  activeTab === tab
                    ? "bg-[#f5faf5] dark:bg-[#0a120a] text-[#3c783c] dark:text-[#8aca8a] font-bold border border-[#a0c0a0] dark:border-[#3a5a3a]"
                    : "text-[#708070] dark:text-[#5a8a5a] hover:text-[#3c783c] dark:hover:text-[#8aca8a] border border-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Blocks tab */}
          {activeTab === "blocks" && (
            <div className="space-y-4">
              {blocks.map(([name, block]) => {
                const badge = getBlockBadge(name);
                return (
                  <div
                    key={name}
                    className="bg-[#f5faf5] dark:bg-[#0a120a] border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm p-6 hover:border-[#a0c0a0] dark:hover:border-[#3a5a3a] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-lg font-bold text-[#3c783c] dark:text-[#8aca8a]">
                        {name}
                      </h3>
                      <span
                        className={`shrink-0 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-sm text-[#506450] dark:text-[#6a8a6a] mb-4">
                      {block.description}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Inputs */}
                      {block.inputs && block.inputs.length > 0 && (
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-[#708070] dark:text-[#5a8a5a] mb-2">
                            Inputs
                          </div>
                          <div className="space-y-1">
                            {block.inputs.map((input) => (
                              <div
                                key={input.name}
                                className="flex items-center gap-2 text-sm"
                              >
                                <span className="text-[#3c783c] dark:text-[#8aca8a]">
                                  {input.name}
                                </span>
                                <span className="text-[#a0b0a0] dark:text-[#3a5a3a]">
                                  :
                                </span>
                                <code className="text-xs bg-[#ebf5eb] dark:bg-[#080c08] px-1.5 py-0.5 rounded-sm text-[#506450] dark:text-[#6a8a6a]">
                                  {input.type}
                                </code>
                                {input.optional && (
                                  <span className="text-[10px] text-[#a0b0a0] dark:text-[#3a5a3a]">
                                    optional
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Outputs */}
                      {block.outputs && block.outputs.length > 0 && (
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-[#708070] dark:text-[#5a8a5a] mb-2">
                            Outputs
                          </div>
                          {block.outputs.map((output) => (
                            <div key={output.name} className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-[#3c783c] dark:text-[#8aca8a]">
                                  {output.name}
                                </span>
                                <span className="text-[#a0b0a0] dark:text-[#3a5a3a]">
                                  :
                                </span>
                                <code className="text-xs bg-[#ebf5eb] dark:bg-[#080c08] px-1.5 py-0.5 rounded-sm text-[#506450] dark:text-[#6a8a6a]">
                                  {output.type}
                                </code>
                              </div>
                              {output.semantics && output.semantics.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {output.semantics.map((s) => (
                                    <span
                                      key={s}
                                      className="text-[10px] bg-[#ebf5eb] dark:bg-[#080c08] border border-[#c8dcc8] dark:border-[#2a3a2a] px-1.5 py-0.5 rounded-sm text-[#3c783c] dark:text-[#8aca8a]"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Constraints */}
                    {block.outputs?.[0]?.constraints &&
                      block.outputs[0].constraints.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#c8dcc8] dark:border-[#2a3a2a]">
                          <div className="text-[10px] uppercase tracking-widest text-[#708070] dark:text-[#5a8a5a] mb-2">
                            Constraints
                          </div>
                          <ul className="space-y-1">
                            {block.outputs[0].constraints.map(
                              (c: string, i: number) => (
                                <li
                                  key={i}
                                  className="text-xs text-[#506450] dark:text-[#6a8a6a] flex items-start gap-2"
                                >
                                  <span className="text-[#8cb43c] dark:text-[#cadd6a] shrink-0">
                                    &bull;
                                  </span>
                                  {c}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Entities tab */}
          {activeTab === "entities" && (
            <div className="grid md:grid-cols-2 gap-4">
              {entities.map(([name, entity]) => (
                <div
                  key={name}
                  className="bg-[#f5faf5] dark:bg-[#0a120a] border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm p-5 hover:border-[#a0c0a0] dark:hover:border-[#3a5a3a] transition-colors"
                >
                  <h3 className="text-sm font-bold text-[#3c783c] dark:text-[#8aca8a] mb-3">
                    entity.{name}
                  </h3>
                  <div className="space-y-1">
                    {entity.fields.map((field: string) => (
                      <div key={field} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8cb43c] dark:bg-[#cadd6a] shrink-0" />
                        <span className="text-xs text-[#506450] dark:text-[#6a8a6a]">
                          {field}
                        </span>
                      </div>
                    ))}
                    {entity.optional?.map((field: string) => (
                      <div key={field} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c8dcc8] dark:bg-[#2a3a2a] shrink-0" />
                        <span className="text-xs text-[#a0b0a0] dark:text-[#3a5a3a]">
                          {field}
                          <span className="ml-1 text-[10px]">(optional)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Semantics tab */}
          {activeTab === "semantics" && (
            <div className="space-y-3">
              {semantics.map(([name, sem]) => (
                <div
                  key={name}
                  className="bg-[#f5faf5] dark:bg-[#0a120a] border border-[#c8dcc8] dark:border-[#2a3a2a] rounded-sm p-5 hover:border-[#a0c0a0] dark:hover:border-[#3a5a3a] transition-colors"
                >
                  <h3 className="text-sm font-bold text-[#3c783c] dark:text-[#8aca8a] mb-1">
                    {name}
                  </h3>
                  <p className="text-xs text-[#506450] dark:text-[#6a8a6a] mb-2">
                    {sem.description}
                  </p>
                  {sem.extraction_hint && (
                    <div className="text-[10px] text-[#708070] dark:text-[#5a8a5a] italic">
                      Hint: {sem.extraction_hint}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
