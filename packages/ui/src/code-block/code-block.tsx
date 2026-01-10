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
          "rounded-sm overflow-hidden",
          "bg-[#050805]",
          "border border-[#2a3a2a]",
          "shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
          className
        )}
        {...props}
      >
        {/* Header */}
        {(filename || copyable) && (
          <div className="flex items-center justify-between px-4 py-3 bg-[#0a120a] border-b border-[#2a3a2a]">
            <div className="flex items-center gap-2">
              {/* Terminal dots */}
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#aa4a4a]" />
                <div className="w-2.5 h-2.5 rounded-sm bg-[#aa8a4a]" />
                <div className="w-2.5 h-2.5 rounded-sm bg-[#4aaa4a]" />
              </div>
              {filename && (
                <span className="ml-3 text-xs text-[#5a8a5a] font-mono uppercase tracking-wider">
                  {filename}
                </span>
              )}
              {language && !filename && (
                <span className="ml-3 text-xs text-[#4a6a4a] font-mono uppercase tracking-wider">
                  {language}
                </span>
              )}
            </div>
            {copyable && (
              <CopyButton
                text={code}
                className="text-[#4a6a4a] hover:text-[#8aca8a]"
              />
            )}
          </div>
        )}

        {/* Code content */}
        <div className="p-4 overflow-x-auto">
          <pre className="text-sm font-mono">
            <code className="text-[#8a9a8a]">
              {showLineNumbers ? (
                lines.map((line, index) => {
                  const lineNumber = index + 1;
                  const isHighlighted = highlightLines.includes(lineNumber);
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex",
                        isHighlighted && "bg-[#0f1a0f] -mx-4 px-4 border-l-2 border-[#5a8a5a]"
                      )}
                    >
                      <span className="w-8 text-[#3a5a3a] text-right mr-4 select-none">
                        {lineNumber}
                      </span>
                      <span className={isHighlighted ? "text-[#8aca8a]" : ""}>{line}</span>
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
