"use client";

import * as React from "react";
import { cn } from "../utils/cn";

/* ========================================
 * Card Root
 * ======================================== */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Enable hover glow effect.
   */
  hover?: boolean;
  /**
   * Card variant for different visual styles.
   */
  variant?: "default" | "elevated" | "outline" | "muted";
}

const cardVariants = {
  default: "bg-[#0a120a]/80 border-[#3a5a3a]",
  elevated: "bg-[#0f1a0f]/90 border-[#5a8a5a]",
  outline: "bg-transparent border-[#3a5a3a]",
  muted: "bg-[#080c08]/60 border-[#2a3a2a]",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-sm border",
        cardVariants[variant],
        "text-[#a0b0a0]",
        hover && "transition-all duration-200 hover:border-[#8aca8a] hover:shadow-[0_0_20px_rgba(138,202,138,0.15)]",
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";

/* ========================================
 * Card Header
 * ======================================== */

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional icon to display in the header.
   */
  icon?: React.ReactNode;
  /**
   * Title text for the card.
   */
  title?: string;
  /**
   * Subtitle text for the card.
   */
  subtitle?: string;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, icon, title, subtitle, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-4", className)}
      {...props}
    >
      {(icon || title || subtitle) ? (
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0 text-[#5a8a5a]">
              {icon}
            </div>
          )}
          <div className="flex flex-col">
            {title && (
              <h3 className="text-sm font-mono font-semibold leading-none tracking-wide uppercase text-[#8aca8a]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs font-mono text-[#5a8a5a] mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  )
);

CardHeader.displayName = "CardHeader";

/* ========================================
 * Card Title
 * ======================================== */

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-mono font-semibold leading-none tracking-wide text-[#cadd6a]",
        className
      )}
      {...props}
    />
  )
);

CardTitle.displayName = "CardTitle";

/* ========================================
 * Card Description
 * ======================================== */

export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm font-mono text-[#6a8a6a]", className)}
    {...props}
  />
));

CardDescription.displayName = "CardDescription";

/* ========================================
 * Card Content
 * ======================================== */

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 pt-0 font-mono text-sm text-[#8a9a8a]", className)} {...props} />
  )
);

CardContent.displayName = "CardContent";

/* ========================================
 * Card Footer
 * ======================================== */

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-4 pt-0 border-t border-[#2a3a2a] mt-4", className)}
      {...props}
    />
  )
);

CardFooter.displayName = "CardFooter";
