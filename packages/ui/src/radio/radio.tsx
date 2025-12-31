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
          "border-2 border-slate-300 bg-white",
          "cursor-pointer",
          "transition-colors duration-150",
          "hover:border-blue-500",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[checked]:border-blue-600",
          className
        )}
        {...props}
      >
        <BaseRadio.Indicator className="flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
        </BaseRadio.Indicator>
      </BaseRadio.Root>
      {label && (
        <label className="text-sm font-medium leading-none text-slate-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
    </div>
  )
);

RadioItem.displayName = "RadioItem";
