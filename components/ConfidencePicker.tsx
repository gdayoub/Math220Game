"use client";
import type { Confidence } from "@/lib/topics";

type Props = {
  value: Confidence;
  onChange: (c: Confidence) => void;
};

const OPTIONS: Array<{ value: Confidence; label: string; color: string }> = [
  { value: "sure", label: "SURE", color: "var(--color-success)" },
  { value: "maybe", label: "MAYBE", color: "var(--color-warning)" },
  { value: "guess", label: "GUESS", color: "var(--color-accent)" },
];

export function ConfidencePicker({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest">
      <span className="text-[var(--color-fg-dim)]">Confidence</span>
      <div className="flex">
        {OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`px-3 py-1 border ${
                active
                  ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-fg-dim)] hover:text-[var(--color-fg)]"
              } transition-colors`}
              style={active ? { borderColor: opt.color, color: opt.color } : undefined}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
