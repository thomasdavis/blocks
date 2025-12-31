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
      "flex h-10 w-full items-center justify-between rounded-md",
      "border border-slate-300 bg-white",
      "px-3 py-2 text-sm text-slate-900",
      "transition-colors duration-150",
      "hover:border-slate-400",
      "placeholder:text-slate-400",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
      className
    )}
    {...props}
  >
    {children}
    <BaseSelect.Icon className="h-4 w-4 text-slate-500">
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
    <BaseSelect.Value ref={ref} className={cn("text-slate-900", className)} {...props} />
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
          "relative z-50 min-w-[8rem] overflow-hidden rounded-lg",
          "border border-slate-200",
          "bg-white text-slate-900",
          "shadow-xl",
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
        "rounded-sm py-2 pl-8 pr-2 text-sm",
        "outline-none",
        "text-slate-700",
        "hover:bg-blue-50 hover:text-blue-900",
        "focus:bg-blue-50 focus:text-blue-900",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <BaseSelect.ItemIndicator>
          <svg
            className="h-4 w-4 text-blue-600"
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
