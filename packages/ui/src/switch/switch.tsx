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
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-sm",
          "bg-[#0a120a]",
          "border border-[#3a5a3a]",
          "transition-all duration-150",
          "hover:border-[#5a8a5a]",
          "focus-visible:outline-none focus-visible:border-[#8aca8a] focus-visible:shadow-[0_0_10px_rgba(138,202,138,0.2)]",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "data-[checked]:bg-[#0f1a0f] data-[checked]:border-[#5a8a5a]",
          className
        )}
        {...props}
      >
        <BaseSwitch.Thumb
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-sm",
            "bg-[#3a5a3a] border border-[#4a6a4a]",
            "transition-all duration-150",
            "translate-x-0 data-[checked]:translate-x-5",
            "data-[checked]:bg-[#8aca8a] data-[checked]:border-[#8aca8a]",
            "data-[checked]:shadow-[0_0_8px_rgba(138,202,138,0.4)]"
          )}
        />
      </BaseSwitch.Root>
      {label && (
        <label className="text-sm font-mono leading-none text-[#8a9a8a] peer-disabled:cursor-not-allowed peer-disabled:opacity-40">
          {label}
        </label>
      )}
    </div>
  )
);

Switch.displayName = "Switch";
