"use client";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  color?: string;
  textColor?: string;
};

export function Pill({
  children,
  color = "var(--paper)",
  textColor = "var(--ink)",
}: Props) {
  return (
    <span
      data-pill
      style={{
        background: color,
        color: textColor,
        border: "3px solid var(--ink)",
        borderRadius: 999,
        padding: "5px 14px",
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: 12,
        letterSpacing: "0.04em",
        boxShadow: "0 3px 0 0 var(--ink)",
        display: "inline-block",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}
