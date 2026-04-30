"use client";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, ReactNode, CSSProperties } from "react";

type Size = "sm" | "md" | "lg";

type Props = Omit<HTMLMotionProps<"button">, "color" | "ref" | "children" | "style"> & {
  children: ReactNode;
  color?: string;
  textColor?: string;
  size?: Size;
  full?: boolean;
  style?: CSSProperties;
};

const SIZE_PADDING: Record<Size, string> = {
  sm: "8px 16px",
  md: "14px 24px",
  lg: "18px 32px",
};
const SIZE_FONT: Record<Size, number> = {
  sm: 14,
  md: 17,
  lg: 22,
};

export const ChunkyButton = forwardRef<HTMLButtonElement, Props>(function ChunkyButton(
  {
    children,
    color = "var(--lemon)",
    textColor = "var(--ink)",
    size = "md",
    full = false,
    style,
    disabled,
    ...rest
  },
  ref,
) {
  const buttonStyle: CSSProperties = {
    background: color,
    color: textColor,
    border: "4px solid var(--ink)",
    borderRadius: 999,
    padding: SIZE_PADDING[size],
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: SIZE_FONT[size],
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: "0 6px 0 0 var(--ink)",
    letterSpacing: "0.01em",
    width: full ? "100%" : undefined,
    opacity: disabled ? 0.55 : 1,
    ...style,
  };
  return (
    <motion.button
      ref={ref}
      whileHover={disabled ? undefined : { y: -2, rotate: -1 }}
      whileTap={disabled ? undefined : { y: 4, boxShadow: "0 2px 0 0 var(--ink)" }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      style={buttonStyle}
      disabled={disabled}
      {...rest}
    >
      {children}
    </motion.button>
  );
});
