"use client";
import { motion } from "framer-motion";

type Props = {
  show: boolean;
};

/** Small persistent reminder to grab paper for harder questions. */
export function PaperHint({ show }: Props) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        background: "var(--cream-deep)",
        border: "3px solid var(--ink)",
        borderRadius: 999,
        boxShadow: "0 3px 0 0 var(--ink)",
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: 11,
        color: "var(--ink)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      <span style={{ fontSize: 14 }}>✎</span>
      Recommend paper for the big ones
    </motion.div>
  );
}
