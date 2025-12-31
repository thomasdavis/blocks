"use client";

import * as React from "react";
import { cn } from "../utils/cn";

/* ========================================
 * Timeline Root
 * ======================================== */

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, children, ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const childCount = childArray.length;

    return (
      <div
        ref={ref}
        className={cn("space-y-12", className)}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement<TimelineItemProps>(child)) {
            return React.cloneElement(child, {
              isLast: index === childCount - 1,
            });
          }
          return child;
        })}
      </div>
    );
  }
);

Timeline.displayName = "Timeline";

/* ========================================
 * Timeline Item
 * ======================================== */

export interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether this is the last item (hides connector line).
   * Set automatically by Timeline.
   */
  isLast?: boolean;
}

export const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, isLast = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative", className)}
      {...props}
    >
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-4 top-12 bottom-0 w-px bg-gradient-to-b from-[var(--ui-border)] to-transparent" />
      )}
      {children}
    </div>
  )
);

TimelineItem.displayName = "TimelineItem";

/* ========================================
 * Timeline Dot
 * ======================================== */

export type TimelineDotVariant = "default" | "gradient";

export interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The visual style variant of the dot.
   * @default "default"
   */
  variant?: TimelineDotVariant;
}

export const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute left-0 top-2 w-8 h-8 rounded-full",
        "flex items-center justify-center",
        "shadow-lg",
        variant === "gradient"
          ? "bg-gradient-to-br from-blue-500 to-cyan-500"
          : "bg-[var(--ui-primary)]",
        className
      )}
      {...props}
    >
      <div className="w-3 h-3 rounded-full bg-[var(--ui-background)]" />
    </div>
  )
);

TimelineDot.displayName = "TimelineDot";

/* ========================================
 * Timeline Content
 * ======================================== */

export interface TimelineContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const TimelineContent = React.forwardRef<
  HTMLDivElement,
  TimelineContentProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("ml-16", className)}
    {...props}
  />
));

TimelineContent.displayName = "TimelineContent";
