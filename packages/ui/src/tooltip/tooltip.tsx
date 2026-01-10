"use client";

import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { cn } from "../utils/cn";

export interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
  closeDelay?: number;
}

export function TooltipProvider({
  children,
  delayDuration = 400,
  closeDelay = 0,
}: TooltipProviderProps) {
  return (
    <BaseTooltip.Provider delay={delayDuration} closeDelay={closeDelay}>
      {children}
    </BaseTooltip.Provider>
  );
}

export interface TooltipProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Tooltip({
  children,
  open,
  defaultOpen,
  onOpenChange,
}: TooltipProps) {
  return (
    <BaseTooltip.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
    </BaseTooltip.Root>
  );
}

export interface TooltipTriggerProps
  extends React.ComponentPropsWithoutRef<typeof BaseTooltip.Trigger> {}

export const TooltipTrigger = React.forwardRef<
  HTMLButtonElement,
  TooltipTriggerProps
>(({ className, ...props }, ref) => (
  <BaseTooltip.Trigger ref={ref} className={className} {...props} />
));

TooltipTrigger.displayName = "TooltipTrigger";

export interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof BaseTooltip.Popup> {
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
}

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  TooltipContentProps
>(({ className, side = "top", sideOffset = 4, children, ...props }, ref) => (
  <BaseTooltip.Portal>
    <BaseTooltip.Positioner side={side} sideOffset={sideOffset}>
      <BaseTooltip.Popup
        ref={ref}
        className={cn(
          "z-50 overflow-hidden rounded-sm px-3 py-1.5",
          "bg-[#0f1a0f] border border-[#3a5a3a] text-[#8aca8a]",
          "text-xs font-mono",
          "shadow-[0_4px_12px_rgba(0,0,0,0.5),0_0_10px_rgba(90,138,90,0.15)]",
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
        {...props}
      >
        {children}
      </BaseTooltip.Popup>
    </BaseTooltip.Positioner>
  </BaseTooltip.Portal>
));

TooltipContent.displayName = "TooltipContent";

export interface TooltipArrowProps
  extends React.ComponentPropsWithoutRef<typeof BaseTooltip.Arrow> {}

export const TooltipArrow = React.forwardRef<HTMLDivElement, TooltipArrowProps>(
  ({ className, ...props }, ref) => (
    <BaseTooltip.Arrow
      ref={ref}
      className={cn("fill-[#0f1a0f]", className)}
      {...props}
    />
  )
);

TooltipArrow.displayName = "TooltipArrow";
