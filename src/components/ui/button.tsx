import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant =
  | "accent"
  | "primary"
  | "secondary"
  | "whatsapp"
  | "ghost";

export type ButtonSize = "sm" | "md" | "lg";

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  accent: "bg-accent text-bg hover:bg-accent-hover shadow-sm",
  primary: "bg-primary text-text hover:bg-primary-hover shadow-sm",
  secondary:
    "bg-surface-2 text-text border border-border hover:border-primary-hover",
  whatsapp: "bg-whatsapp text-bg hover:brightness-105 shadow-sm",
  ghost: "bg-transparent text-text-muted hover:bg-surface-2 hover:text-text",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3.5 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
): string {
  return `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`.trim();
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}
