"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cn } from "../utils/cn";

export interface PopoverProps
  extends React.ComponentPropsWithoutRef<typeof BasePopover.Root> {}

export function Popover({ children, ...props }: PopoverProps) {
  return <BasePopover.Root {...props}>{children}</BasePopover.Root>;
}

export interface PopoverTriggerProps
  extends React.ComponentPropsWithoutRef<typeof BasePopover.Trigger> {}

export const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  PopoverTriggerProps
>(({ className, ...props }, ref) => (
  <BasePopover.Trigger ref={ref} className={className} {...props} />
));

PopoverTrigger.displayName = "PopoverTrigger";

export interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof BasePopover.Popup> {
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
}

export const PopoverContent = React.forwardRef<
  HTMLDivElement,
  PopoverContentProps
>(({ className, side = "bottom", sideOffset = 4, ...props }, ref) => (
  <BasePopover.Portal>
    <BasePopover.Positioner side={side} sideOffset={sideOffset}>
      <BasePopover.Popup
        ref={ref}
        className={cn(
          "z-50 w-72 rounded-md",
          "border border-slate-200",
          "bg-white",
          "p-4 text-slate-900",
          "shadow-lg outline-none",
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
        {...props}
      />
    </BasePopover.Positioner>
  </BasePopover.Portal>
));

PopoverContent.displayName = "PopoverContent";

export interface PopoverArrowProps
  extends React.ComponentPropsWithoutRef<typeof BasePopover.Arrow> {}

export const PopoverArrow = React.forwardRef<HTMLDivElement, PopoverArrowProps>(
  ({ className, ...props }, ref) => (
    <BasePopover.Arrow
      ref={ref}
      className={cn("fill-white", className)}
      {...props}
    />
  )
);

PopoverArrow.displayName = "PopoverArrow";
