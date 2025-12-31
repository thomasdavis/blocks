"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Copy, Check } from "lucide-react";
import { Button } from "@blocksai/ui/button";

interface JsonViewerProps {
  data: unknown;
  collapsed?: boolean;
  maxHeight?: string;
}

export function JsonViewer({ data, collapsed = true, maxHeight = "400px" }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg border border-[var(--ui-border)] bg-[var(--ui-background)]">
      <div className="absolute top-2 right-2 z-10">
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div
        className="overflow-auto p-4 font-mono text-sm"
        style={{ maxHeight }}
      >
        <JsonNode data={data} name={null} defaultCollapsed={collapsed} level={0} />
      </div>
    </div>
  );
}

interface JsonNodeProps {
  data: unknown;
  name: string | null;
  defaultCollapsed: boolean;
  level: number;
}

function JsonNode({ data, name, defaultCollapsed, level }: JsonNodeProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed && level > 0);

  if (data === null) {
    return (
      <span>
        {name !== null && <span className="text-purple-400">&quot;{name}&quot;</span>}
        {name !== null && <span className="text-[var(--ui-foreground)]">: </span>}
        <span className="text-gray-500">null</span>
      </span>
    );
  }

  if (typeof data === "boolean") {
    return (
      <span>
        {name !== null && <span className="text-purple-400">&quot;{name}&quot;</span>}
        {name !== null && <span className="text-[var(--ui-foreground)]">: </span>}
        <span className="text-blue-400">{data.toString()}</span>
      </span>
    );
  }

  if (typeof data === "number") {
    return (
      <span>
        {name !== null && <span className="text-purple-400">&quot;{name}&quot;</span>}
        {name !== null && <span className="text-[var(--ui-foreground)]">: </span>}
        <span className="text-amber-400">{data}</span>
      </span>
    );
  }

  if (typeof data === "string") {
    // Truncate long strings
    const displayValue = data.length > 100 ? `${data.substring(0, 100)}...` : data;
    return (
      <span>
        {name !== null && <span className="text-purple-400">&quot;{name}&quot;</span>}
        {name !== null && <span className="text-[var(--ui-foreground)]">: </span>}
        <span className="text-green-400">&quot;{displayValue}&quot;</span>
      </span>
    );
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <span>
          {name !== null && <span className="text-purple-400">&quot;{name}&quot;</span>}
          {name !== null && <span className="text-[var(--ui-foreground)]">: </span>}
          <span className="text-[var(--ui-foreground)]">[]</span>
        </span>
      );
    }

    return (
      <div>
        <span
          className="cursor-pointer hover:bg-[var(--ui-background-muted)] rounded px-1 -mx-1"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="inline h-3 w-3 mr-1" />
          ) : (
            <ChevronDown className="inline h-3 w-3 mr-1" />
          )}
          {name !== null && <span className="text-purple-400">&quot;{name}&quot;</span>}
          {name !== null && <span className="text-[var(--ui-foreground)]">: </span>}
          <span className="text-[var(--ui-foreground)]">[</span>
          {isCollapsed && (
            <span className="text-gray-500"> {data.length} items </span>
          )}
          {isCollapsed && <span className="text-[var(--ui-foreground)]">]</span>}
        </span>
        {!isCollapsed && (
          <div className="ml-4 border-l border-[var(--ui-border)] pl-3">
            {data.map((item, index) => (
              <div key={index}>
                <JsonNode
                  data={item}
                  name={null}
                  defaultCollapsed={defaultCollapsed}
                  level={level + 1}
                />
                {index < data.length - 1 && <span className="text-[var(--ui-foreground)]">,</span>}
              </div>
            ))}
          </div>
        )}
        {!isCollapsed && <span className="text-[var(--ui-foreground)]">]</span>}
      </div>
    );
  }

  if (typeof data === "object") {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return (
        <span>
          {name !== null && <span className="text-purple-400">&quot;{name}&quot;</span>}
          {name !== null && <span className="text-[var(--ui-foreground)]">: </span>}
          <span className="text-[var(--ui-foreground)]">{"{}"}</span>
        </span>
      );
    }

    return (
      <div>
        <span
          className="cursor-pointer hover:bg-[var(--ui-background-muted)] rounded px-1 -mx-1"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="inline h-3 w-3 mr-1" />
          ) : (
            <ChevronDown className="inline h-3 w-3 mr-1" />
          )}
          {name !== null && <span className="text-purple-400">&quot;{name}&quot;</span>}
          {name !== null && <span className="text-[var(--ui-foreground)]">: </span>}
          <span className="text-[var(--ui-foreground)]">{"{"}</span>
          {isCollapsed && (
            <span className="text-gray-500"> {entries.length} keys </span>
          )}
          {isCollapsed && <span className="text-[var(--ui-foreground)]">{"}"}</span>}
        </span>
        {!isCollapsed && (
          <div className="ml-4 border-l border-[var(--ui-border)] pl-3">
            {entries.map(([key, value], index) => (
              <div key={key}>
                <JsonNode
                  data={value}
                  name={key}
                  defaultCollapsed={defaultCollapsed}
                  level={level + 1}
                />
                {index < entries.length - 1 && <span className="text-[var(--ui-foreground)]">,</span>}
              </div>
            ))}
          </div>
        )}
        {!isCollapsed && <span className="text-[var(--ui-foreground)]">{"}"}</span>}
      </div>
    );
  }

  return <span className="text-gray-500">{String(data)}</span>;
}
