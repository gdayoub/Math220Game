"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CHARACTERS, type Character, type CharacterId } from "@/lib/characters";
import { useClient } from "@/lib/clientStore";
import { GlitchText } from "@/components/effects/GlitchText";

export default function SelectPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/";
  const { selectedCharacter, setCharacter } = useClient();
  const [hovered, setHovered] = useState<CharacterId | null>(null);
  const [locking, setLocking] = useState<CharacterId | null>(null);
  const focused = CHARACTERS.find((c) => c.id === (hovered ?? selectedCharacter)) ?? CHARACTERS[0];

  function lockIn(c: Character) {
    setLocking(c.id);
    setCharacter(c.id);
    setTimeout(() => router.push(next), 900);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 border-b border-[var(--color-border)] flex justify-between items-center">
        <Link
          href="/"
          className="font-mono text-xs text-[var(--color-fg-dim)] hover:text-[var(--color-accent)] uppercase tracking-widest"
        >
          ← exit
        </Link>
        <GlitchText
          as="h1"
          className="font-mono text-lg tracking-[0.3em] text-[var(--color-accent)] text-glow"
        >
          SELECT OPERATOR
        </GlitchText>
        <span className="w-12" />
      </header>

      <main className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
        {/* Roster grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CHARACTERS.map((c, i) => {
            const active = (hovered ?? selectedCharacter) === c.id;
            const isLocked = locking === c.id;
            return (
              <motion.button
                key={c.id}
                onMouseEnter={() => setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => lockIn(c)}
                disabled={!!locking}
                className="text-left tile-in"
                style={{ animationDelay: `${i * 60}ms` }}
                whileTap={{ scale: 0.96 }}
              >
                <div
                  className={`relative border p-5 transition-all duration-200 cursor-pointer ${
                    active
                      ? "border-[var(--color-accent)] glow-red-strong bg-[color:var(--color-accent)]/5"
                      : "border-[var(--color-border)] hover:border-[var(--color-accent)]"
                  } ${isLocked ? "pulse-border" : ""}`}
                  style={{
                    boxShadow: active
                      ? `0 0 24px ${c.color}55, inset 0 0 40px ${c.color}10`
                      : undefined,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className="text-4xl text-glow font-mono"
                      style={{ color: c.color, textShadow: `0 0 16px ${c.color}` }}
                    >
                      {c.glyph}
                    </span>
                    <span className="font-mono text-[10px] tracking-widest text-[var(--color-fg-dim)]">
                      {selectedCharacter === c.id ? "EQUIPPED" : "READY"}
                    </span>
                  </div>
                  <div className="font-mono text-sm uppercase tracking-widest mb-1">{c.name}</div>
                  <div className="text-xs text-[var(--color-fg-dim)]">{c.title}</div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Detail pane */}
        <AnimatePresence mode="wait">
          <motion.aside
            key={focused.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.18 }}
            className="border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 sticky top-6"
            style={{
              boxShadow: `inset 0 0 60px ${focused.color}10, 0 0 28px ${focused.color}30`,
            }}
          >
            <div
              className="text-7xl text-glow font-mono text-center mb-4"
              style={{ color: focused.color, textShadow: `0 0 24px ${focused.color}` }}
            >
              {focused.glyph}
            </div>
            <div
              className="text-center font-mono text-2xl tracking-[0.3em] mb-1"
              style={{ color: focused.color }}
            >
              {focused.name}
            </div>
            <div className="text-center text-xs text-[var(--color-fg-dim)] uppercase tracking-widest mb-6">
              {focused.title}
            </div>
            <p className="text-sm text-[var(--color-fg)] mb-6 italic">"{focused.tagline}"</p>
            <div className="border-t border-[var(--color-border)] pt-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-fg-dim)] mb-2">
                Passive
              </div>
              <div
                className="font-mono text-sm leading-relaxed"
                style={{ color: focused.color }}
              >
                ▸ {focused.passive}
              </div>
            </div>
            <button
              onClick={() => lockIn(focused)}
              disabled={!!locking}
              className="mt-6 w-full font-mono uppercase tracking-[0.3em] py-3 border-2 transition-all"
              style={{
                color: focused.color,
                borderColor: focused.color,
                boxShadow: `0 0 16px ${focused.color}55`,
              }}
            >
              {locking === focused.id ? "▸ LOCKING IN…" : "▸ LOCK IN"}
            </button>
          </motion.aside>
        </AnimatePresence>
      </main>
    </div>
  );
}
