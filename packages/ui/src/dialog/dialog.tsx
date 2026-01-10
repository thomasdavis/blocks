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
  /**
   * Whether clicking outside the dialog should close it.
   * @default false (clicking outside will close)
   */
  dismissible?: boolean;
}

export function Dialog({
  children,
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
  dismissible = true,
}: DialogProps) {
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
      disablePointerDismissal={!dismissible}
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
      "bg-[#050805]/90 backdrop-blur-sm",
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
>(({ className, children, onClick, ...props }, ref) => (
  <DialogPortal>
    <DialogBackdrop />
    <BaseDialog.Popup
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
        "w-full max-w-lg max-h-[85vh]",
        "rounded-sm border border-[#3a5a3a]",
        "bg-[#0a120a] text-[#a0b0a0]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(90,138,90,0.1)]",
        "p-6",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      onClick={(e) => {
        // Prevent clicks inside the dialog from closing it
        e.stopPropagation();
        onClick?.(e);
      }}
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
        "mt-6 pt-4 border-t border-[#2a3a2a]",
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
      "text-lg font-mono font-semibold leading-none tracking-wide uppercase",
      "text-[#cadd6a]",
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
    className={cn("text-sm font-mono text-[#6a8a6a] mt-2", className)}
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
      "rounded-sm p-1 text-[#5a8a5a]",
      "transition-all duration-150",
      "hover:text-[#8aca8a] hover:bg-[#0f1a0f]",
      "focus:outline-none focus:ring-1 focus:ring-[#5a8a5a]",
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
