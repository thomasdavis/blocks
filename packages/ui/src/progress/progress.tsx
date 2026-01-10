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
        "relative h-2 w-full overflow-hidden rounded-sm",
        "bg-[#0a120a] border border-[#2a3a2a]",
        className
      )}
      {...props}
    >
      <BaseProgress.Track className="relative h-full w-full">
        <BaseProgress.Indicator
          className={cn(
            "h-full w-full rounded-sm",
            "bg-gradient-to-r from-[#3a5a3a] to-[#8aca8a]",
            "shadow-[0_0_8px_rgba(138,202,138,0.4)]",
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
