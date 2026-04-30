"use client";
import { motion } from "framer-motion";

type Props = {
  color: string;
  glyph: string;
  size?: number;
  glyphSize?: number;
  eyeColor?: string;
  hover?: boolean;
};

export function Bean({
  color,
  glyph,
  size = 120,
  glyphSize,
  eyeColor = "var(--ink)",
  hover = false,
}: Props) {
  const finalGlyphSize = glyphSize ?? (glyph.length > 1 ? 22 : 36);
  return (
    <motion.div
      animate={{ y: [0, -6, 0], rotate: [-1.5, 1.5, -1.5] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      whileHover={hover ? { scale: 1.08, rotate: -4 } : undefined}
      style={{
        width: size,
        height: size * 1.05,
        background: color,
        border: "4px solid var(--ink)",
        borderRadius: "60% 60% 50% 50% / 70% 70% 40% 40%",
        boxShadow: "0 8px 0 0 var(--ink)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {/* eyes */}
      <span
        style={{
          position: "absolute",
          left: size * 0.27,
          top: size * 0.22,
          width: 11,
          height: 11,
          borderRadius: "50%",
          background: eyeColor,
        }}
      />
      <span
        style={{
          position: "absolute",
          right: size * 0.27,
          top: size * 0.22,
          width: 11,
          height: 11,
          borderRadius: "50%",
          background: eyeColor,
        }}
      />
      {/* feet */}
      <span
        style={{
          position: "absolute",
          bottom: -4,
          left: size * 0.2,
          width: size * 0.22,
          height: 10,
          background: "var(--ink)",
          borderRadius: "50%",
        }}
      />
      <span
        style={{
          position: "absolute",
          bottom: -4,
          right: size * 0.2,
          width: size * 0.22,
          height: 10,
          background: "var(--ink)",
          borderRadius: "50%",
        }}
      />
      {/* glyph chest emblem */}
      <span
        data-bean-glyph-chip
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: finalGlyphSize,
          color: "var(--ink)",
          background: "var(--paper)",
          border: "4px solid var(--ink)",
          borderRadius: "50%",
          width: size * 0.55,
          height: size * 0.55,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 3px 0 0 var(--ink)",
          marginTop: 8,
          lineHeight: 1,
        }}
      >
        {glyph}
      </span>
    </motion.div>
  );
}
