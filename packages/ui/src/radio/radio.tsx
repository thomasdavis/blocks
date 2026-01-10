"use client";

import * as React from "react";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { cn } from "../utils/cn";

export interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof BaseRadioGroup> {}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, ...props }, ref) => (
    <BaseRadioGroup
      ref={ref}
      className={cn("flex flex-col gap-3", className)}
      {...props}
    />
  )
);

RadioGroup.displayName = "RadioGroup";

export interface RadioItemProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseRadio.Root>, "children"> {
  label?: string;
}

export const RadioItem = React.forwardRef<HTMLButtonElement, RadioItemProps>(
  ({ className, label, ...props }, ref) => (
    <div className="flex items-center gap-2">
      <BaseRadio.Root
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center",
          "aspect-square h-5 w-5 rounded-full",
          "border border-[#3a5a3a] bg-[#0a120a]",
          "cursor-pointer",
          "transition-all duration-150",
          "hover:border-[#5a8a5a]",
          "focus:outline-none focus-visible:border-[#8aca8a] focus-visible:shadow-[0_0_10px_rgba(138,202,138,0.2)]",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "data-[checked]:border-[#5a8a5a]",
          className
        )}
        {...props}
      >
        <BaseRadio.Indicator className="flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-[#8aca8a] shadow-[0_0_6px_rgba(138,202,138,0.5)]" />
        </BaseRadio.Indicator>
      </BaseRadio.Root>
      {label && (
        <label className="text-sm font-mono leading-none text-[#8a9a8a] peer-disabled:cursor-not-allowed peer-disabled:opacity-40">
          {label}
        </label>
      )}
    </div>
  )
);

RadioItem.displayName = "RadioItem";
