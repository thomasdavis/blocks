"use client";

import * as React from "react";
import { cn } from "../utils/cn";

export interface CopyButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  /**
   * The text to copy to clipboard.
   */
  text: string;
  /**
   * Duration in ms to show success state.
   * @default 2000
   */
  successDuration?: number;
  /**
   * Callback when text is copied.
   */
  onCopy?: () => void;
}

/**
 * A button that copies text to the clipboard with visual feedback.
 *
 * @example
 * ```tsx
 * <CopyButton text="npm install @blocksai/cli" />
 * ```
 */
export const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    { className, text, successDuration = 2000, onCopy, ...props },
    ref
  ) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        onCopy?.();
        setTimeout(() => setCopied(false), successDuration);
      } catch (err) {
        console.error("Failed to copy text:", err);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleCopy}
        className={cn(
          "text-[var(--ui-foreground-muted)] hover:text-[var(--ui-foreground)]",
          "transition-colors duration-[var(--ui-duration-fast)]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-ring)]",
          className
        )}
        title={copied ? "Copied!" : "Copy to clipboard"}
        aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
        {...props}
      >
        {copied ? (
          <svg
            className="w-5 h-5 text-[var(--ui-success)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    );
  }
);

CopyButton.displayName = "CopyButton";
