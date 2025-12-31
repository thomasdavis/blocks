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
  | "link";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md",
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md",
  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 border border-slate-200",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md",
  outline:
    "border-2 border-slate-300 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100",
  ghost:
    "text-slate-700 hover:bg-slate-100 active:bg-slate-200",
  link: "text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline p-0 h-auto font-medium",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm rounded-md gap-1.5",
  md: "h-10 px-4 py-2 text-sm rounded-md gap-2",
  lg: "h-12 px-6 text-base rounded-lg gap-2",
  icon: "h-10 w-10 rounded-md",
};

const buttonClassName = (
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string
) =>
  cn(
    // Base styles
    "inline-flex items-center justify-center whitespace-nowrap font-medium",
    "transition-all duration-150 ease-out",
    "active:scale-[0.98]",
    // Focus styles
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    // Disabled styles
    "disabled:pointer-events-none disabled:opacity-50",
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
