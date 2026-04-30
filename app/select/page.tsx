"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { CHARACTERS, type Character } from "@/lib/characters";
import { useClient } from "@/lib/clientStore";
import { Bean } from "@/components/ui/Bean";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { ThemePicker } from "@/components/ui/ThemePicker";

export default function SelectPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/";
  const { selectedCharacter, setCharacter } = useClient();
  const [locking, setLocking] = useState<string | null>(null);

  function lockIn(c: Character) {
    setLocking(c.id);
    setCharacter(c.id);
    setTimeout(() => router.push(next), 600);
  }

  return (
    <div
      style={{
        padding: "32px 40px 60px",
        maxWidth: 1180,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <Link href="/">
          <ChunkyButton size="sm" color="var(--paper)">
            ← Back
          </ChunkyButton>
        </Link>
        <motion.h1
          data-wordmark
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 48,
            color: "var(--accent-1)",
            WebkitTextStroke: "3px var(--ink)",
            textShadow: "0 6px 0 var(--ink)",
            letterSpacing: "-0.01em",
            lineHeight: 0.95,
          }}
        >
          Pick your bean
        </motion.h1>
        <span style={{ width: 80 }} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
        }}
      >
        {CHARACTERS.map((c, i) => {
          const isSelected = selectedCharacter === c.id;
          const isLocking = locking === c.id;
          return (
            <motion.button
              key={c.id}
              type="button"
              initial={{ y: 20, opacity: 0, scale: 0.92 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{
                delay: 0.05 + i * 0.06,
                type: "spring",
                stiffness: 300,
                damping: 15,
              }}
              whileHover={{ y: -6, rotate: i % 2 === 0 ? -2 : 2 }}
              whileTap={{ y: 4, scale: 0.97 }}
              onClick={() => lockIn(c)}
              disabled={!!locking}
              style={{
                background: isSelected ? "var(--lemon)" : "var(--paper)",
                border: "4px solid var(--ink)",
                borderRadius: 28,
                boxShadow: isLocking
                  ? "0 4px 0 0 var(--ink)"
                  : "0 8px 0 0 var(--ink)",
                transform: isLocking ? "translateY(4px)" : undefined,
                padding: 22,
                cursor: locking ? "wait" : "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                textAlign: "center",
                font: "inherit",
              }}
              data-light-card
            >
              <Bean
                color={c.color}
                glyph={c.glyph}
                glyphSize={c.glyph.length > 1 ? 22 : 36}
                size={130}
                eyeColor={c.eyeColor ?? "var(--ink)"}
                characterId={c.id}
              />
              <div data-on-paper style={{ marginTop: 14 }}>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 22,
                    color: "var(--ink)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {c.name}
                </h3>
                <p
                  data-on-paper-soft
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 11,
                    color: "var(--ink-soft)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginTop: 2,
                  }}
                >
                  {c.title}
                </p>
              </div>
              <p
                data-on-paper-soft
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--ink-soft)",
                  lineHeight: 1.3,
                  maxWidth: 240,
                }}
              >
                {c.passive}
              </p>
              <p
                data-on-paper-soft
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "var(--ink-faint)",
                  fontStyle: "italic",
                }}
              >
                &ldquo;{c.tagline}&rdquo;
              </p>
              {(isSelected || isLocking) && (
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 11,
                    color: "var(--ink)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    background: "var(--mint)",
                    border: "3px solid var(--ink)",
                    borderRadius: 999,
                    padding: "4px 12px",
                    boxShadow: "0 3px 0 0 var(--ink)",
                  }}
                >
                  {isLocking ? "Locking in…" : "Equipped ✓"}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
      <ThemePicker />
    </div>
  );
}
