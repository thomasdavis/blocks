import type * as React from "react";

/**
 * Polymorphic component props - allows changing the rendered element.
 */
export type AsChildProps<DefaultElementProps> =
  | ({ asChild?: false } & DefaultElementProps)
  | { asChild: true; children: React.ReactNode };

/**
 * Extract props from a component type.
 */
export type PropsOf<T extends React.ElementType> =
  React.ComponentPropsWithoutRef<T>;

/**
 * Make certain props required.
 */
export type RequiredProps<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

/**
 * Common size variants used across components.
 */
export type Size = "sm" | "md" | "lg";

/**
 * Common variant types for semantic styling.
 */
export type SemanticVariant =
  | "default"
  | "primary"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost";

/**
 * Status variants for badges and indicators.
 */
export type StatusVariant =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "major"
  | "minor"
  | "patch";
