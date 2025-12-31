"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cn } from "../utils/cn";

export interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

export function Dialog({
  children,
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
}: DialogProps) {
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      {children}
    </BaseDialog.Root>
  );
}

export interface DialogTriggerProps
  extends React.ComponentPropsWithoutRef<typeof BaseDialog.Trigger> {}

export const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  DialogTriggerProps
>(({ className, ...props }, ref) => (
  <BaseDialog.Trigger ref={ref} className={className} {...props} />
));

DialogTrigger.displayName = "DialogTrigger";

export interface DialogPortalProps
  extends React.ComponentPropsWithoutRef<typeof BaseDialog.Portal> {}

export function DialogPortal({ children, ...props }: DialogPortalProps) {
  return <BaseDialog.Portal {...props}>{children}</BaseDialog.Portal>;
}

export interface DialogBackdropProps
  extends React.ComponentPropsWithoutRef<typeof BaseDialog.Backdrop> {}

export const DialogBackdrop = React.forwardRef<
  HTMLDivElement,
  DialogBackdropProps
>(({ className, ...props }, ref) => (
  <BaseDialog.Backdrop
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      "bg-black/50 backdrop-blur-sm",
      "animate-in fade-in-0",
      className
    )}
    {...props}
  />
));

DialogBackdrop.displayName = "DialogBackdrop";

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof BaseDialog.Popup> {}

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  DialogContentProps
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogBackdrop />
    <BaseDialog.Popup
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
        "w-full max-w-lg max-h-[85vh]",
        "rounded-xl border border-slate-200",
        "bg-white text-slate-900",
        "shadow-xl",
        "p-6",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </BaseDialog.Popup>
  </DialogPortal>
));

DialogContent.displayName = "DialogContent";

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        "mt-6",
        className
      )}
      {...props}
    />
  );
}

export interface DialogTitleProps
  extends React.ComponentPropsWithoutRef<typeof BaseDialog.Title> {}

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  DialogTitleProps
>(({ className, ...props }, ref) => (
  <BaseDialog.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      "text-slate-900",
      className
    )}
    {...props}
  />
));

DialogTitle.displayName = "DialogTitle";

export interface DialogDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof BaseDialog.Description> {}

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <BaseDialog.Description
    ref={ref}
    className={cn("text-sm text-slate-500 mt-2", className)}
    {...props}
  />
));

DialogDescription.displayName = "DialogDescription";

export interface DialogCloseProps
  extends React.ComponentPropsWithoutRef<typeof BaseDialog.Close> {}

export const DialogClose = React.forwardRef<
  HTMLButtonElement,
  DialogCloseProps
>(({ className, ...props }, ref) => (
  <BaseDialog.Close
    ref={ref}
    className={className}
    {...props}
  />
));

DialogClose.displayName = "DialogClose";

// X button for dialog corner
export interface DialogCloseButtonProps
  extends React.ComponentPropsWithoutRef<typeof BaseDialog.Close> {}

export const DialogCloseButton = React.forwardRef<
  HTMLButtonElement,
  DialogCloseButtonProps
>(({ className, ...props }, ref) => (
  <BaseDialog.Close
    ref={ref}
    className={cn(
      "absolute right-4 top-4",
      "rounded-sm opacity-70 p-1",
      "transition-opacity hover:opacity-100",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      "disabled:pointer-events-none",
      className
    )}
    {...props}
  >
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </BaseDialog.Close>
));

DialogCloseButton.displayName = "DialogCloseButton";
