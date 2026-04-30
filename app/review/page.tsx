"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ALL_TOPICS, TOPIC_META, type Topic } from "@/lib/topics";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { Pill } from "@/components/ui/Pill";
import { ThemePicker } from "@/components/ui/ThemePicker";

const TOPIC_DECOR: Record<
  Topic,
  { glyph: string; color: string; textColor?: string }
> = {
  rref: { glyph: "⊞", color: "var(--mint)" },
  independence: { glyph: "⇄", color: "var(--sky)" },
  basis: { glyph: "{b}", color: "var(--peach)" },
  eigen: {
    glyph: "λ",
    color: "var(--grape)",
    textColor: "var(--on-dark-text)",
  },
  orthogonality: { glyph: "⊥", color: "var(--pink)" },
  leastSquares: { glyph: "≈", color: "var(--lemon)" },
  matrixOps: { glyph: "⊗", color: "var(--mint)" },
};

export default function ReviewIndex() {
  return (
    <>
      <ScreenShell
        title="Review"
        subtitle="The why behind each topic — explainers, formulas, worked examples."
        glyph="✎"
        accent="var(--peach)"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {ALL_TOPICS.map((t, i) => {
            const meta = TOPIC_META[t];
            const decor = TOPIC_DECOR[t];
            return (
              <Link key={t} href={`/review/${t}`} style={{ textDecoration: "none" }}>
                <motion.div
                  data-topic={t}
                  initial={{ y: 14, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.05 + i * 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  }}
                  whileHover={{ y: -4, rotate: i % 2 === 0 ? -2 : 2 }}
                  whileTap={{ y: 2, scale: 0.97 }}
                  style={{
                    background: decor.color,
                    color: decor.textColor ?? "var(--ink)",
                    border: "4px solid var(--ink)",
                    borderRadius: 22,
                    boxShadow: "0 7px 0 0 var(--ink)",
                    padding: "20px 22px",
                    cursor: "pointer",
                    minHeight: 160,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <motion.span
                      data-glyph-chip
                      animate={{ rotate: [-4, 4, -4] }}
                      transition={{
                        duration: 2.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.15,
                      }}
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: decor.glyph.length > 1 ? 24 : 36,
                        background: "var(--paper)",
                        color: "var(--ink)",
                        border: "4px solid var(--ink)",
                        borderRadius: 16,
                        width: 64,
                        height: 64,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 0 0 var(--ink)",
                        lineHeight: 1,
                      }}
                    >
                      {decor.glyph}
                    </motion.span>
                    <Pill>STUDY</Pill>
                  </div>
                  <div>
                    <h2
                      data-tile-text
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: 22,
                        color: decor.textColor ?? "var(--ink)",
                        marginBottom: 4,
                        lineHeight: 1.05,
                      }}
                    >
                      {meta.label}
                    </h2>
                    <p
                      data-tile-tagline
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        fontSize: 13,
                        color:
                          decor.textColor === "var(--on-dark-text)"
                            ? "#E5DAFF"
                            : "var(--ink-soft)",
                        lineHeight: 1.3,
                      }}
                    >
                      {meta.tagline}
                    </p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </ScreenShell>
      <ThemePicker />
    </>
  );
}
