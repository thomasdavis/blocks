"use client";

import * as React from "react";
import { cn } from "../utils/cn";

/* ========================================
 * Card Root
 * ======================================== */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Enable hover shadow effect.
   */
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-[var(--ui-border)]",
        "bg-[var(--ui-background)] text-[var(--ui-foreground)]",
        "shadow-sm",
        hover && "transition-shadow hover:shadow-lg",
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
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      {(icon || title || subtitle) ? (
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="flex flex-col">
            {title && (
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-[var(--ui-foreground-muted)]">
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
        "text-xl font-semibold leading-none tracking-tight",
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
    className={cn("text-sm text-[var(--ui-foreground-muted)]", className)}
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
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
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
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
);

CardFooter.displayName = "CardFooter";
