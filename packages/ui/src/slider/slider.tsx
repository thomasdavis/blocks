"use client";

import * as React from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { cn } from "../utils/cn";

export interface SliderProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof BaseSlider.Root>,
    "children"
  > {}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, ...props }, ref) => (
    <BaseSlider.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center py-2",
        className
      )}
      {...props}
    >
      <BaseSlider.Control className="relative flex w-full items-center">
        <BaseSlider.Track
          className={cn(
            "relative h-2 w-full grow overflow-hidden rounded-full",
            "bg-slate-200"
          )}
        >
          <BaseSlider.Indicator className="absolute h-full bg-blue-600 rounded-full" />
        </BaseSlider.Track>
        <BaseSlider.Thumb
          className={cn(
            "absolute block h-5 w-5 rounded-full",
            "border-2 border-blue-600",
            "bg-white shadow-md",
            "cursor-grab active:cursor-grabbing",
            "transition-colors",
            "hover:bg-blue-50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        />
      </BaseSlider.Control>
    </BaseSlider.Root>
  )
);

Slider.displayName = "Slider";
