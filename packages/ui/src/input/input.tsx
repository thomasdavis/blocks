"use client";

import * as React from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import { cn } from "../utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <BaseInput
      type={type}
      className={cn(
        "flex h-10 w-full rounded-sm",
        "border border-[#3a5a3a] bg-[#0a120a]",
        "px-3 py-2 text-sm font-mono text-[#a0b0a0]",
        "transition-all duration-150",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#8aca8a]",
        "placeholder:text-[#4a6a4a]",
        "hover:border-[#5a8a5a]",
        "focus-visible:outline-none focus-visible:border-[#8aca8a] focus-visible:shadow-[0_0_10px_rgba(138,202,138,0.2)]",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-[#080c08]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-sm",
        "border border-[#3a5a3a] bg-[#0a120a]",
        "px-3 py-2 text-sm font-mono text-[#a0b0a0]",
        "transition-all duration-150",
        "placeholder:text-[#4a6a4a]",
        "hover:border-[#5a8a5a]",
        "focus-visible:outline-none focus-visible:border-[#8aca8a] focus-visible:shadow-[0_0_10px_rgba(138,202,138,0.2)]",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-[#080c08]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
