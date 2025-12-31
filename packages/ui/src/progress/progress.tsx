"use client";

import * as React from "react";
import { Progress as BaseProgress } from "@base-ui/react/progress";
import { cn } from "../utils/cn";

export interface ProgressProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof BaseProgress.Root>,
    "children"
  > {
  indicatorClassName?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, indicatorClassName, value, ...props }, ref) => (
    <BaseProgress.Root
      ref={ref}
      value={value}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full",
        "bg-slate-200",
        className
      )}
      {...props}
    >
      <BaseProgress.Track className="relative h-full w-full">
        <BaseProgress.Indicator
          className={cn(
            "h-full w-full bg-blue-600 rounded-full",
            "transition-transform duration-300 ease-out",
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
        />
      </BaseProgress.Track>
    </BaseProgress.Root>
  )
);

Progress.displayName = "Progress";
