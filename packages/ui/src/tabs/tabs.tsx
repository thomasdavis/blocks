"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cn } from "../utils/cn";

export interface TabsProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof BaseTabs.Root>,
    "orientation"
  > {
  orientation?: "horizontal" | "vertical";
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <BaseTabs.Root
      ref={ref}
      orientation={orientation}
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-row" : "flex-col",
        className
      )}
      {...props}
    />
  )
);

Tabs.displayName = "Tabs";

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof BaseTabs.List> {}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <BaseTabs.List
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-lg p-1",
        "bg-slate-100 text-slate-600",
        "data-[orientation=vertical]:flex-col data-[orientation=vertical]:h-auto",
        className
      )}
      {...props}
    />
  )
);

TabsList.displayName = "TabsList";

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof BaseTabs.Tab> {}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, ...props }, ref) => (
    <BaseTabs.Tab
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap",
        "rounded-md px-3 py-1.5",
        "text-sm font-medium",
        "transition-all duration-150",
        "text-slate-500",
        "hover:text-slate-900 hover:bg-slate-200/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-selected:bg-white aria-selected:text-slate-900 aria-selected:shadow-md aria-selected:font-semibold",
        className
      )}
      {...props}
    />
  )
);

TabsTrigger.displayName = "TabsTrigger";

export interface TabsIndicatorProps
  extends React.ComponentPropsWithoutRef<typeof BaseTabs.Indicator> {}

export const TabsIndicator = React.forwardRef<
  HTMLSpanElement,
  TabsIndicatorProps
>(({ className, ...props }, ref) => (
  <BaseTabs.Indicator
    ref={ref}
    className={cn(
      "absolute bg-blue-600",
      "transition-all duration-150",
      "data-[orientation=horizontal]:bottom-0 data-[orientation=horizontal]:h-0.5",
      "data-[orientation=horizontal]:left-[var(--active-tab-left)] data-[orientation=horizontal]:w-[var(--active-tab-width)]",
      "data-[orientation=vertical]:left-0 data-[orientation=vertical]:w-0.5",
      "data-[orientation=vertical]:top-[var(--active-tab-top)] data-[orientation=vertical]:h-[var(--active-tab-height)]",
      className
    )}
    {...props}
  />
));

TabsIndicator.displayName = "TabsIndicator";

export interface TabsPanelProps
  extends React.ComponentPropsWithoutRef<typeof BaseTabs.Panel> {}

export const TabsPanel = React.forwardRef<HTMLDivElement, TabsPanelProps>(
  ({ className, ...props }, ref) => (
    <BaseTabs.Panel
      ref={ref}
      className={cn(
        "mt-2 p-4",
        "rounded-lg bg-slate-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "data-[hidden]:hidden",
        className
      )}
      {...props}
    />
  )
);

TabsPanel.displayName = "TabsPanel";

export const TabsContent = TabsPanel;
