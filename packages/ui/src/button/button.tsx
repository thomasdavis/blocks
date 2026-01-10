"use client";

import * as React from "react";
import { cn } from "../utils/cn";

export type ButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link"
  | "accent";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-[#0a120a] text-[#8aca8a] border border-[#3a5a3a] hover:bg-[#0f1a0f] hover:border-[#5a8a5a] hover:text-[#9ada9a] hover:shadow-[0_0_10px_rgba(138,202,138,0.2)]",
  primary:
    "bg-[#5a8a5a] text-[#050805] border border-[#5a8a5a] hover:bg-[#8aca8a] hover:border-[#8aca8a] hover:shadow-[0_0_15px_rgba(138,202,138,0.3)]",
  secondary:
    "bg-[#0a120a] text-[#6a9a6a] border border-[#2a3a2a] hover:bg-[#0f1a0f] hover:border-[#3a5a3a] hover:text-[#8aca8a]",
  destructive:
    "bg-[#2a1515] text-[#ca6a6a] border border-[#5a2a2a] hover:bg-[#3a1a1a] hover:border-[#8a4a4a] hover:text-[#ea8a8a]",
  outline:
    "bg-transparent text-[#6a9a6a] border border-[#3a5a3a] hover:bg-[#0a120a] hover:border-[#5a8a5a] hover:text-[#8aca8a]",
  ghost:
    "bg-transparent text-[#6a9a6a] hover:bg-[#0a120a] hover:text-[#8aca8a]",
  link:
    "bg-transparent text-[#8aca8a] hover:text-[#cadd6a] underline-offset-4 hover:underline p-0 h-auto",
  accent:
    "bg-[#1a1a08] text-[#cadd6a] border border-[#8aaa4a] hover:bg-[#252510] hover:border-[#cadd6a] hover:shadow-[0_0_15px_rgba(202,221,106,0.3)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-sm gap-1.5",
  md: "h-10 px-4 py-2 text-sm rounded-sm gap-2",
  lg: "h-12 px-6 text-base rounded-sm gap-2",
  icon: "h-10 w-10 rounded-sm",
};

const buttonClassName = (
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string
) =>
  cn(
    // Base styles
    "inline-flex items-center justify-center whitespace-nowrap font-mono font-medium uppercase tracking-wider",
    "transition-all duration-150 ease-out",
    "active:scale-[0.98]",
    // Focus styles - green glow
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5a8a5a] focus-visible:ring-offset-1 focus-visible:ring-offset-[#050805]",
    // Disabled styles
    "disabled:pointer-events-none disabled:opacity-40 disabled:grayscale",
    // Variant and size
    variantStyles[variant],
    sizeStyles[size],
    className
  );

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const classes = buttonClassName(variant, size, className);

    if (asChild) {
      return <>{children}</>;
    }

    return (
      <button className={classes} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);

export function getButtonClassName(
  variant: ButtonVariant = "default",
  size: ButtonSize = "md",
  className?: string
): string {
  return buttonClassName(variant, size, className);
}

Button.displayName = "Button";
