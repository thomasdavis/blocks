"use client";

import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cn } from "../utils/cn";

export interface SwitchProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof BaseSwitch.Root>,
    "children"
  > {
  label?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, label, ...props }, ref) => (
    <div className="flex items-center gap-3">
      <BaseSwitch.Root
        ref={ref}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
          "bg-slate-200",
          "border-2 border-transparent",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[checked]:bg-blue-600",
          className
        )}
        {...props}
      >
        <BaseSwitch.Thumb
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full",
            "bg-white shadow-md ring-1 ring-slate-200",
            "transition-transform duration-150",
            "translate-x-0 data-[checked]:translate-x-5"
          )}
        />
      </BaseSwitch.Root>
      {label && (
        <label className="text-sm font-medium leading-none text-slate-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
    </div>
  )
);

Switch.displayName = "Switch";
