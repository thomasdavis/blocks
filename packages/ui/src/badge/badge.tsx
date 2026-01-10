"use client";

import * as React from "react";
import { cn } from "../utils/cn";

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "info"
  | "major"
  | "minor"
  | "patch"
  | "accent";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[#0a120a] text-[#8a9a8a] border border-[#2a3a2a]",
  primary: "bg-[#0f1a0f] text-[#8aca8a] border border-[#3a5a3a]",
  secondary: "bg-[#080c08] text-[#6a8a6a] border border-[#2a3a2a]",
  destructive: "bg-[#1a0808] text-[#ca6a6a] border border-[#5a2a2a]",
  outline: "bg-transparent text-[#6a9a6a] border border-[#3a5a3a]",
  success: "bg-[#081a08] text-[#6aca6a] border border-[#2a5a2a]",
  warning: "bg-[#1a1808] text-[#caaa6a] border border-[#5a4a2a]",
  info: "bg-[#081818] text-[#6aaaca] border border-[#2a4a5a]",
  major: "bg-[#1a0808] text-[#ea6a6a] border border-[#6a2a2a]",
  minor: "bg-[#081018] text-[#6a8aca] border border-[#2a3a5a]",
  patch: "bg-[#081a08] text-[#6aca6a] border border-[#2a5a2a]",
  accent: "bg-[#1a1a08] text-[#cadd6a] border border-[#5a5a2a]",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center font-mono font-medium uppercase tracking-wider",
        "rounded-sm",
        "transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
);

Badge.displayName = "Badge";
