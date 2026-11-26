import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "whatsapp"
  | "danger-outline"
  | "danger-solid";

export type ButtonSize = "sm" | "md" | "lg";

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-ink text-on-ink hover:bg-ink-hover",
  secondary:
    "bg-transparent border border-ink text-ink hover:bg-surface-2",
  whatsapp: "bg-whatsapp text-whatsapp-text hover:brightness-95",
  "danger-outline":
    "bg-transparent border border-danger text-danger hover:bg-surface-2",
  "danger-solid": "bg-danger text-surface hover:opacity-95",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-xs sm:text-sm",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-11 px-5 text-sm sm:text-base",
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
