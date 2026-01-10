"use client";

import * as React from "react";
import { cn } from "../utils/cn";

export type LoadingDotsSize = "sm" | "md" | "lg";
export type LoadingDotsColor = "primary" | "secondary" | "muted" | "current" | "accent";

export interface LoadingDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: LoadingDotsSize;
  color?: LoadingDotsColor;
  label?: string;
}

const sizeStyles: Record<LoadingDotsSize, { dot: string; gap: string }> = {
  sm: { dot: "w-1.5 h-1.5", gap: "gap-1" },
  md: { dot: "w-2 h-2", gap: "gap-1.5" },
  lg: { dot: "w-3 h-3", gap: "gap-2" },
};

const colorStyles: Record<LoadingDotsColor, string> = {
  primary: "bg-[#8aca8a]",
  secondary: "bg-[#5a8a5a]",
  muted: "bg-[#4a6a4a]",
  current: "bg-current",
  accent: "bg-[#cadd6a]",
};

export const LoadingDots = React.forwardRef<HTMLDivElement, LoadingDotsProps>(
  ({ className, size = "md", color = "primary", label, ...props }, ref) => {
    const { dot, gap } = sizeStyles[size];
    const colorClass = colorStyles[color];

    return (
      <div
        ref={ref}
        className={cn("flex items-center", gap, className)}
        role="status"
        aria-label={label || "Loading"}
        {...props}
      >
        <div className={cn("flex items-center", gap)}>
          <div
            className={cn(dot, colorClass, "rounded-sm animate-bounce shadow-[0_0_6px_rgba(138,202,138,0.4)]")}
            style={{ animationDelay: "0ms", animationDuration: "0.6s" }}
          />
          <div
            className={cn(dot, colorClass, "rounded-sm animate-bounce shadow-[0_0_6px_rgba(138,202,138,0.4)]")}
            style={{ animationDelay: "150ms", animationDuration: "0.6s" }}
          />
          <div
            className={cn(dot, colorClass, "rounded-sm animate-bounce shadow-[0_0_6px_rgba(138,202,138,0.4)]")}
            style={{ animationDelay: "300ms", animationDuration: "0.6s" }}
          />
        </div>
        {label && (
          <span className="ml-2 text-sm font-mono text-[#6a8a6a]">{label}</span>
        )}
      </div>
    );
  }
);

LoadingDots.displayName = "LoadingDots";
