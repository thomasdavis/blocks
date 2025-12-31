"use client";

import * as React from "react";
import { cn } from "../utils/cn";
import { CopyButton } from "../copy-button";

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The code to display.
   */
  code: string;
  /**
   * The programming language for syntax highlighting.
   */
  language?: string;
  /**
   * Optional filename to display in the header.
   */
  filename?: string;
  /**
   * Whether to show line numbers.
   */
  showLineNumbers?: boolean;
  /**
   * Lines to highlight (1-indexed).
   */
  highlightLines?: number[];
  /**
   * Whether to show a copy button.
   * @default true
   */
  copyable?: boolean;
}

/**
 * A styled code block with optional syntax highlighting and copy button.
 *
 * @example
 * ```tsx
 * <CodeBlock
 *   code="npm install @blocksai/cli"
 *   language="bash"
 *   copyable
 * />
 * ```
 */
export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      className,
      code,
      language,
      filename,
      showLineNumbers = false,
      highlightLines = [],
      copyable = true,
      ...props
    },
    ref
  ) => {
    const lines = code.split("\n");

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl overflow-hidden",
          "bg-slate-900 dark:bg-slate-950",
          "border border-slate-800",
          "shadow-lg",
          className
        )}
        {...props}
      >
        {/* Header */}
        {(filename || copyable) && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700">
            <div className="flex items-center gap-2">
              {/* Traffic lights */}
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              {filename && (
                <span className="ml-3 text-sm text-slate-400 font-mono">
                  {filename}
                </span>
              )}
            </div>
            {copyable && (
              <CopyButton
                text={code}
                className="text-slate-400 hover:text-slate-200"
              />
            )}
          </div>
        )}

        {/* Code content */}
        <div className="p-4 overflow-x-auto">
          <pre className="text-sm font-mono">
            <code className="text-slate-300">
              {showLineNumbers ? (
                lines.map((line, index) => {
                  const lineNumber = index + 1;
                  const isHighlighted = highlightLines.includes(lineNumber);
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex",
                        isHighlighted && "bg-blue-500/10 -mx-4 px-4"
                      )}
                    >
                      <span className="w-8 text-slate-600 text-right mr-4 select-none">
                        {lineNumber}
                      </span>
                      <span>{line}</span>
                    </div>
                  );
                })
              ) : (
                code
              )}
            </code>
          </pre>
        </div>
      </div>
    );
  }
);

CodeBlock.displayName = "CodeBlock";
