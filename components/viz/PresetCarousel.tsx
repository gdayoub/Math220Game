"use client";
import { motion } from "framer-motion";
import { Tex } from "@/components/Tex";
import type { Mat2 } from "@/lib/viz/linalg2";
import { fmtMat2, matEq } from "@/lib/viz/linalg2";

export type Preset = {
  label: string;
  matrix: Mat2;
  caption: string;
  color: string;
};

export const PRESETS: Preset[] = [
  {
    label: "Identity",
    matrix: [[1, 0], [0, 1]],
    caption: "$I$ — does nothing. $\\det = 1$.",
    color: "var(--paper)",
  },
  {
    label: "Rotate 90°",
    matrix: [[0, -1], [1, 0]],
    caption: "Rotation. No real eigenvectors. $\\det = 1$.",
    color: "var(--sky)",
  },
  {
    label: "Reflect X",
    matrix: [[1, 0], [0, -1]],
    caption: "Reflection across $x$-axis. $\\det = -1$ (flips orientation).",
    color: "var(--pink)",
  },
  {
    label: "Scale ×2",
    matrix: [[2, 0], [0, 2]],
    caption: "Uniform scaling. Every direction is an eigenvector with $\\lambda = 2$.",
    color: "var(--mint)",
  },
  {
    label: "Shear",
    matrix: [[1, 1], [0, 1]],
    caption: "Horizontal shear. Defective: only one eigenvector direction.",
    color: "var(--lemon)",
  },
  {
    label: "Stretch",
    matrix: [[3, 0], [0, 1]],
    caption: "Anisotropic scaling. $\\det = 3$ (area scaling factor).",
    color: "var(--peach)",
  },
  {
    label: "Singular",
    matrix: [[1, 2], [2, 4]],
    caption: "Rank 1 — collapses to a line. $\\det = 0$.",
    color: "var(--grape)",
  },
  {
    label: "Project x",
    matrix: [[1, 0], [0, 0]],
    caption: "Projection onto $x$-axis. $\\det = 0$.",
    color: "var(--cream-deep)",
  },
  {
    label: "Near-singular",
    matrix: [[1, 1.0001], [1, 1]],
    caption: "Tiny $\\det$, huge condition number — numerically dangerous.",
    color: "var(--pink-deep)",
  },
];

type Props = {
  current: Mat2;
  onPick: (m: Mat2) => void;
};

export function PresetCarousel({ current, onPick }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        overflowX: "auto",
        padding: "8px 4px 14px",
        scrollbarWidth: "thin",
      }}
    >
      {PRESETS.map((p, i) => {
        const active = matEq(current, p.matrix);
        const labelTextColor =
          p.color === "var(--grape)" || p.color === "var(--pink-deep)"
            ? "var(--on-dark-text)"
            : "var(--ink)";
        return (
          <motion.button
            key={p.label}
            type="button"
            whileHover={{ y: -3, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
            whileTap={{ y: 2, scale: 0.97 }}
            onClick={() => onPick(p.matrix)}
            aria-pressed={active}
            style={{
              flex: "0 0 auto",
              background: p.color,
              border: active ? "4px solid var(--accent-1)" : "3px solid var(--ink)",
              borderRadius: 18,
              boxShadow: "0 4px 0 0 var(--ink)",
              padding: "12px 14px",
              minWidth: 168,
              textAlign: "left",
              cursor: "pointer",
              color: labelTextColor,
              fontFamily: "var(--font-display)",
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 6,
                color: labelTextColor,
              }}
            >
              {p.label}
            </div>
            <div
              data-on-paper
              style={{
                background: "var(--paper)",
                border: "2px solid var(--ink)",
                borderRadius: 10,
                padding: "8px 10px",
                marginBottom: 8,
                color: "var(--ink)",
                fontSize: 14,
                lineHeight: 1,
              }}
            >
              <Tex>{`$${fmtMat2(p.matrix)}$`}</Tex>
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 12,
                lineHeight: 1.3,
                color: labelTextColor,
                opacity: 0.9,
              }}
            >
              <Tex>{p.caption}</Tex>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
