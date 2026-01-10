"use client";

import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { cn } from "../utils/cn";

export interface CheckboxProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof BaseCheckbox.Root>,
    "children"
  > {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => (
    <div className="flex items-center gap-2">
      <BaseCheckbox.Root
        ref={ref}
        className={cn(
          "peer inline-flex items-center justify-center",
          "h-5 w-5 shrink-0 rounded-sm",
          "border border-[#3a5a3a] bg-[#0a120a]",
          "cursor-pointer",
          "transition-all duration-150",
          "hover:border-[#5a8a5a]",
          "focus-visible:outline-none focus-visible:border-[#8aca8a] focus-visible:shadow-[0_0_10px_rgba(138,202,138,0.2)]",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "data-[checked]:bg-[#5a8a5a] data-[checked]:border-[#8aca8a]",
          className
        )}
        {...props}
      >
        <BaseCheckbox.Indicator className="flex items-center justify-center text-[#050805]">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      {label && (
        <label className="text-sm font-mono leading-none text-[#8a9a8a] peer-disabled:cursor-not-allowed peer-disabled:opacity-40">
          {label}
        </label>
      )}
    </div>
  )
);

Checkbox.displayName = "Checkbox";
