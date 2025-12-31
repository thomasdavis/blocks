"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { cn } from "../utils/cn";

export interface MenuProps
  extends React.ComponentPropsWithoutRef<typeof BaseMenu.Root> {}

export function Menu({ children, ...props }: MenuProps) {
  return <BaseMenu.Root {...props}>{children}</BaseMenu.Root>;
}

export interface MenuTriggerProps
  extends React.ComponentPropsWithoutRef<typeof BaseMenu.Trigger> {}

export const MenuTrigger = React.forwardRef<HTMLButtonElement, MenuTriggerProps>(
  ({ className, ...props }, ref) => (
    <BaseMenu.Trigger ref={ref} className={className} {...props} />
  )
);

MenuTrigger.displayName = "MenuTrigger";

export interface MenuContentProps
  extends React.ComponentPropsWithoutRef<typeof BaseMenu.Popup> {}

export const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(
  ({ className, ...props }, ref) => (
    <BaseMenu.Portal>
      <BaseMenu.Positioner>
        <BaseMenu.Popup
          ref={ref}
          className={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-md",
            "border border-slate-200",
            "bg-white",
            "p-1 text-slate-900",
            "shadow-lg",
            "animate-in fade-in-0 zoom-in-95",
            className
          )}
          {...props}
        />
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
);

MenuContent.displayName = "MenuContent";

export interface MenuItemProps
  extends React.ComponentPropsWithoutRef<typeof BaseMenu.Item> {}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({ className, ...props }, ref) => (
    <BaseMenu.Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center",
        "rounded-sm px-2 py-1.5 text-sm",
        "outline-none transition-colors",
        "text-slate-700",
        "hover:bg-blue-50 hover:text-blue-900",
        "focus:bg-blue-50 focus:text-blue-900",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    />
  )
);

MenuItem.displayName = "MenuItem";

export interface MenuSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof BaseMenu.Separator> {}

export const MenuSeparator = React.forwardRef<
  HTMLDivElement,
  MenuSeparatorProps
>(({ className, ...props }, ref) => (
  <BaseMenu.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-slate-200", className)}
    {...props}
  />
));

MenuSeparator.displayName = "MenuSeparator";
