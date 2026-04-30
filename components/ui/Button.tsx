"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "ghost" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  full?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", full, className = "", children, ...rest },
  ref,
) {
  const base =
    "px-4 py-2 font-mono uppercase tracking-wider text-sm transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
  const variants: Record<Variant, string> = {
    primary:
      "bg-transparent border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-black hover:glow-red",
    ghost:
      "bg-transparent border border-[var(--color-border)] text-[var(--color-fg-dim)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
    danger:
      "bg-[var(--color-accent-strong)] text-white hover:bg-[var(--color-accent)]",
  };
  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${full ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});
