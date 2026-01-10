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
            "relative h-2 w-full grow overflow-hidden rounded-sm",
            "bg-[#0a120a] border border-[#2a3a2a]"
          )}
        >
          <BaseSlider.Indicator className="absolute h-full bg-gradient-to-r from-[#3a5a3a] to-[#5a8a5a] rounded-sm" />
        </BaseSlider.Track>
        <BaseSlider.Thumb
          className={cn(
            "absolute block h-5 w-5 rounded-sm",
            "border border-[#5a8a5a]",
            "bg-[#0a120a]",
            "cursor-grab active:cursor-grabbing",
            "transition-all duration-150",
            "hover:border-[#8aca8a] hover:shadow-[0_0_10px_rgba(138,202,138,0.3)]",
            "focus-visible:outline-none focus-visible:border-[#8aca8a] focus-visible:shadow-[0_0_10px_rgba(138,202,138,0.3)]",
            "disabled:pointer-events-none disabled:opacity-40"
          )}
        />
      </BaseSlider.Control>
    </BaseSlider.Root>
  )
);

Slider.displayName = "Slider";
