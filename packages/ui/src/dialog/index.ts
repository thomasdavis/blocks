export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogCloseButton,
} from "./dialog";
export type {
  DialogProps,
  DialogTriggerProps,
  DialogPortalProps,
  DialogBackdropProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogFooterProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
  DialogCloseButtonProps,
} from "./dialog";

// Re-export primitives for advanced usage
export { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
