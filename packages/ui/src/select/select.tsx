"use client";

import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { cn } from "../utils/cn";

export interface SelectProps
  extends React.ComponentPropsWithoutRef<typeof BaseSelect.Root> {}

export function Select({ children, ...props }: SelectProps) {
  return <BaseSelect.Root {...props}>{children}</BaseSelect.Root>;
}

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof BaseSelect.Trigger> {}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(({ className, children, ...props }, ref) => (
  <BaseSelect.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-sm",
      "border border-[#3a5a3a] bg-[#0a120a]",
      "px-3 py-2 text-sm font-mono text-[#a0b0a0]",
      "transition-all duration-150",
      "hover:border-[#5a8a5a]",
      "placeholder:text-[#4a6a4a]",
      "focus:outline-none focus:border-[#8aca8a] focus:shadow-[0_0_10px_rgba(138,202,138,0.2)]",
      "disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-[#080c08]",
      className
    )}
    {...props}
  >
    {children}
    <BaseSelect.Icon className="h-4 w-4 text-[#5a8a5a]">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </BaseSelect.Icon>
  </BaseSelect.Trigger>
));

SelectTrigger.displayName = "SelectTrigger";

export interface SelectValueProps
  extends React.ComponentPropsWithoutRef<typeof BaseSelect.Value> {}

export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, ...props }, ref) => (
    <BaseSelect.Value ref={ref} className={cn("text-[#a0b0a0]", className)} {...props} />
  )
);

SelectValue.displayName = "SelectValue";

export interface SelectContentProps
  extends React.ComponentPropsWithoutRef<typeof BaseSelect.Popup> {}

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(({ className, children, ...props }, ref) => (
  <BaseSelect.Portal>
    <BaseSelect.Positioner>
      <BaseSelect.Popup
        ref={ref}
        className={cn(
          "relative z-50 min-w-[8rem] overflow-hidden rounded-sm",
          "border border-[#3a5a3a]",
          "bg-[#0a120a] text-[#a0b0a0]",
          "shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(90,138,90,0.1)]",
          "p-1",
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
        {...props}
      >
        {children}
      </BaseSelect.Popup>
    </BaseSelect.Positioner>
  </BaseSelect.Portal>
));

SelectContent.displayName = "SelectContent";

export interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof BaseSelect.Item> {}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => (
    <BaseSelect.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center",
        "rounded-sm py-2 pl-8 pr-2 text-sm font-mono",
        "outline-none",
        "text-[#8a9a8a]",
        "hover:bg-[#0f1a0f] hover:text-[#8aca8a]",
        "focus:bg-[#0f1a0f] focus:text-[#8aca8a]",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <BaseSelect.ItemIndicator>
          <svg
            className="h-4 w-4 text-[#8aca8a]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </BaseSelect.ItemIndicator>
      </span>
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  )
);

SelectItem.displayName = "SelectItem";
