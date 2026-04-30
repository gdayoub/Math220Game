"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ALL_TOPICS, TOPIC_META, type Topic } from "@/lib/topics";
import { useClient } from "@/lib/clientStore";
import { getCharacter } from "@/lib/characters";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { Bean } from "@/components/ui/Bean";
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

export default function BossSelect() {
  const router = useRouter();
  const [picked, setPicked] = useState<Topic | null>(null);
  const { selectedCharacter } = useClient();
  const character = getCharacter(selectedCharacter);

  function begin() {
    if (!picked) return;
    if (!character) {
      router.push(
        `/select?next=${encodeURIComponent(`/play/boss?topic=${picked}`)}`,
      );
      return;
    }
    router.push(`/play/boss?topic=${picked}`);
  }

  return (
    <>
      <ScreenShell
        title="Boss Battle"
        subtitle="Pick a topic. Ten escalating problems. Beat the boss."
        glyph="▲"
        accent="var(--grape)"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {ALL_TOPICS.map((t, i) => {
            const meta = TOPIC_META[t];
            const decor = TOPIC_DECOR[t];
            const isPicked = picked === t;
            return (
              <motion.button
                key={t}
                type="button"
                whileHover={{ y: -4, rotate: i % 2 === 0 ? -2 : 2 }}
                whileTap={{ y: 2, scale: 0.97 }}
                onClick={() => setPicked(t)}
                style={{
                  background: decor.color,
                  color: decor.textColor ?? "var(--ink)",
                  border: "4px solid var(--ink)",
                  borderRadius: 22,
                  boxShadow: isPicked
                    ? "0 4px 0 0 var(--ink)"
                    : "0 7px 0 0 var(--ink)",
                  padding: "18px 18px 20px",
                  cursor: "pointer",
                  textAlign: "left",
                  transform: isPicked ? "translateY(3px)" : undefined,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  font: "inherit",
                }}
              >
                <span
                  data-glyph-chip
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: decor.glyph.length > 1 ? 22 : 32,
                    background: "var(--paper)",
                    color: "var(--ink)",
                    border: "4px solid var(--ink)",
                    borderRadius: 14,
                    width: 60,
                    height: 60,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 3px 0 0 var(--ink)",
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  {decor.glyph}
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <span
                    data-tile-text
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 18,
                      lineHeight: 1.1,
                      color: decor.textColor ?? "var(--ink)",
                    }}
                  >
                    {meta.label}
                  </span>
                  <span
                    data-tile-tagline
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                      fontSize: 12,
                      opacity: 0.85,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color:
                        decor.textColor === "var(--on-dark-text)"
                          ? "#E5DAFF"
                          : "var(--ink-soft)",
                    }}
                  >
                    {isPicked ? "Selected ✓" : "10 problems"}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div
          data-light-card
          style={{
            background: "var(--paper)",
            border: "4px solid var(--ink)",
            borderRadius: 24,
            boxShadow: "0 6px 0 0 var(--ink)",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {character ? (
              <>
                <span data-bean-on-paper>
                  <Bean
                    color={character.color}
                    glyph={character.glyph}
                    glyphSize={character.glyph.length > 1 ? 18 : 26}
                    size={56}
                    eyeColor={character.eyeColor ?? "var(--ink)"}
                  />
                </span>
                <div data-on-paper>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 16,
                      color: "var(--ink)",
                    }}
                  >
                    {character.name}
                  </div>
                  <div
                    data-on-paper-soft
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                      fontSize: 12,
                      color: "var(--ink-soft)",
                    }}
                  >
                    {character.passive}
                  </div>
                </div>
              </>
            ) : (
              <div data-on-paper>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 16,
                    color: "var(--ink)",
                  }}
                >
                  No operator selected
                </div>
                <div
                  data-on-paper-soft
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: 12,
                    color: "var(--ink-soft)",
                  }}
                >
                  Pick a bean before entering the gauntlet.
                </div>
              </div>
            )}
          </div>
          <ChunkyButton
            color={picked ? "var(--lemon)" : "var(--cream-deep)"}
            onClick={begin}
            disabled={!picked}
          >
            {picked ? "Begin Battle ⚔" : "Pick a topic"}
          </ChunkyButton>
        </div>
      </ScreenShell>
      <ThemePicker />
    </>
  );
}
