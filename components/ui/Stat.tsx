"use client";
import { ReactNode } from "react";

type Props = {
  label: string;
  value: ReactNode;
  accent?: boolean;
};

export function Stat({ label, value, accent }: Props) {
  return (
    <div
      data-stat
      style={{
        display: "flex",
        flexDirection: "column",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <span
        data-stat-label
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 10,
          color: "var(--ink-soft)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          whiteSpace: "nowrap",
          opacity: 0.85,
        }}
      >
        {label}
      </span>
      <span
        data-stat-value
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 22,
          color: accent ? "var(--accent-1)" : "var(--ink)",
          marginTop: 2,
        }}
      >
        {value}
      </span>
    </div>
  );
}
