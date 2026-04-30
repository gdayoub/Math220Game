"use client";
import { motion } from "framer-motion";

export function Heart({ filled = true }: { filled?: boolean }) {
  return (
    <motion.span
      animate={filled ? { scale: [1, 1.08, 1] } : {}}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      style={{
        width: 22,
        height: 22,
        background: filled ? "var(--pink)" : "var(--cream-deep)",
        border: "3px solid var(--ink)",
        borderRadius: 6,
        transform: "rotate(45deg)",
        boxShadow: filled ? "0 3px 0 0 var(--ink)" : "none",
        display: "inline-block",
      }}
    />
  );
}
