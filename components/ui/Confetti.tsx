"use client";
import { motion } from "framer-motion";

const COLORS = [
  "var(--pink)",
  "var(--mint)",
  "var(--lemon)",
  "var(--grape)",
  "var(--sky)",
  "var(--peach)",
];

export function Confetti({ count = 28 }: { count?: number }) {
  const pieces = Array.from({ length: count });
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      {pieces.map((_, i) => {
        const x = Math.random() * 100;
        const dur = 1.4 + Math.random() * 0.8;
        const rot = Math.random() * 720 - 360;
        const c = COLORS[i % COLORS.length];
        return (
          <motion.div
            key={i}
            initial={{ y: -20, x: `${x}vw`, opacity: 1, rotate: 0 }}
            animate={{ y: "110vh", rotate: rot, opacity: [1, 1, 0] }}
            transition={{ duration: dur, ease: "easeIn" }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 14,
              height: 14,
              background: c,
              border: "2px solid var(--ink)",
              borderRadius: i % 3 === 0 ? "50%" : 4,
            }}
          />
        );
      })}
    </div>
  );
}
