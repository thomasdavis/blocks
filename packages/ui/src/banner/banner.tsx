"use client";

import * as React from "react";
import { cn } from "../utils/cn";

export type BannerVariant = "default" | "info" | "warning" | "success" | "error" | "discovery";

export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BannerVariant;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variantStyles: Record<BannerVariant, string> = {
  default: "bg-[#0a120a] border-[#2a3a2a] text-[#8a9a8a]",
  info: "bg-[#081018] border-[#2a3a5a] text-[#6aaaca]",
  warning: "bg-[#1a1808] border-[#5a4a2a] text-[#caaa6a]",
  success: "bg-[#081a08] border-[#2a5a2a] text-[#6aca6a]",
  error: "bg-[#1a0808] border-[#5a2a2a] text-[#ca6a6a]",
  discovery: "bg-gradient-to-r from-[#0a120a] to-[#0a1a1a] border-[#2a4a4a] text-[#8acaca]",
};

const iconStyles: Record<BannerVariant, string> = {
  default: "text-[#5a8a5a]",
  info: "text-[#4a8aaa]",
  warning: "text-[#aa8a4a]",
  success: "text-[#4aaa4a]",
  error: "text-[#aa4a4a]",
  discovery: "text-[#4aaaaa]",
};

export const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      className,
      variant = "default",
      icon,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref
  ) => {
    const [dismissed, setDismissed] = React.useState(false);

    if (dismissed) {
      return null;
    }

    const handleDismiss = () => {
      setDismissed(true);
      onDismiss?.();
    };

    const defaultIcon = {
      info: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      success: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      warning: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      error: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };

    const showIcon = icon || (variant !== "default" && variant !== "discovery" ? defaultIcon[variant as keyof typeof defaultIcon] : null);

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "rounded-sm border px-4 py-3 font-mono",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-center">
          {showIcon && (
            <span className={cn("mr-3 flex-shrink-0", iconStyles[variant])}>
              {showIcon}
            </span>
          )}
          <p className="text-sm flex-1">{children}</p>
          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              className="ml-4 text-current opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }
);

Banner.displayName = "Banner";
