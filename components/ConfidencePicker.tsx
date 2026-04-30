"use client";
import { motion } from "framer-motion";
import type { Confidence } from "@/lib/topics";

type Props = {
  value: Confidence;
  onChange: (c: Confidence) => void;
};

const OPTIONS: Array<{ value: Confidence; label: string; color: string }> = [
  { value: "sure", label: "SURE", color: "var(--mint)" },
  { value: "maybe", label: "MAYBE", color: "var(--lemon)" },
  { value: "guess", label: "GUESS", color: "var(--pink)" },
];

export function ConfidencePicker({ value, onChange }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 12,
          color: "var(--ink-soft)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Confidence
      </span>
      <div
        style={{
          display: "flex",
          border: "3px solid var(--ink)",
          borderRadius: 999,
          overflow: "hidden",
          boxShadow: "0 4px 0 0 var(--ink)",
          background: "var(--paper)",
        }}
      >
        {OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <motion.button
              key={opt.value}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => onChange(opt.value)}
              style={{
                border: 0,
                padding: "8px 18px",
                cursor: "pointer",
                background: active ? opt.color : "transparent",
                color: "var(--ink)",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: "0.04em",
              }}
            >
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
