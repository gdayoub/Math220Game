"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Profile } from "@/lib/profile";
import { useClient } from "@/lib/clientStore";
import { getCharacter } from "@/lib/characters";
import { BootGate } from "@/components/effects/BootSplash";
import { Bean } from "@/components/ui/Bean";
import { Pill } from "@/components/ui/Pill";
import { Stat } from "@/components/ui/Stat";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { ThemePicker } from "@/components/ui/ThemePicker";

type Mode = {
  slug: string;
  title: string;
  glyph: string;
  tagline: string;
  color: string;
  textColor: string;
  href?: string;
};

const MODES: Mode[] = [
  {
    slug: "survival",
    title: "Survival",
    glyph: "⚔",
    tagline: "Three lives. Difficulty climbs. Don't blink.",
    color: "var(--pink)",
    textColor: "var(--ink)",
  },
  {
    slug: "weakness",
    title: "Weakness Training",
    glyph: "◎",
    tagline: "AI hunts your blind spots.",
    color: "var(--mint)",
    textColor: "var(--ink)",
  },
  {
    slug: "speed",
    title: "Speed Run",
    glyph: "↯",
    tagline: "Ten questions. Beat the clock.",
    color: "var(--lemon)",
    textColor: "var(--ink)",
  },
  {
    slug: "boss",
    title: "Boss Battle",
    glyph: "▲",
    tagline: "Pick a topic. Ten escalating problems.",
    color: "var(--grape)",
    textColor: "var(--on-dark-text)",
    href: "/boss",
  },
  {
    slug: "viz",
    title: "Visualization",
    glyph: "✶",
    tagline: "See transformations breathe. Predict before reveal.",
    color: "var(--sky)",
    textColor: "var(--ink)",
    href: "/viz",
  },
  {
    slug: "stats",
    title: "Performance",
    glyph: "★",
    tagline: "Mistake log + cheat-sheet export.",
    color: "var(--peach)",
    textColor: "var(--ink)",
    href: "/stats",
  },
];

export default function HomePage() {
  return (
    <BootGate>
      <HomeBody />
      <ThemePicker />
    </BootGate>
  );
}

function HomeBody() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { selectedCharacter } = useClient();
  const character = getCharacter(selectedCharacter);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then(setProfile);
  }, []);

  const accuracy =
    profile && profile.totalQuestions > 0
      ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100)
      : 0;

  return (
    <div style={{ padding: "32px 40px 60px", maxWidth: 1180, margin: "0 auto", width: "100%" }}>
      {/* Hero + operator strip */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <motion.div
            data-wordmark
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 64,
              lineHeight: 0.95,
              color: "var(--accent-1)",
              WebkitTextStroke: "4px var(--ink)",
              textShadow: "0 7px 0 var(--ink)",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            MATH 220
          </motion.div>
          <div
            data-arena
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 24,
              color: "var(--accent-2)",
              letterSpacing: "0.06em",
            }}
          >
            ARENA
          </div>
        </div>

        <Link href={`/select?next=${encodeURIComponent("/")}`} style={{ textDecoration: "none" }}>
          <motion.div
            data-light-card
            whileHover={{ scale: 1.03, rotate: -1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: "var(--paper)",
              border: "4px solid var(--ink)",
              borderRadius: 28,
              padding: "14px 22px 14px 14px",
              boxShadow: "0 6px 0 0 var(--ink)",
              cursor: "pointer",
              minHeight: 96,
            }}
          >
            {character ? (
              <>
                <span data-bean-on-paper>
                  <Bean
                    color={character.color}
                    glyph={character.glyph}
                    glyphSize={character.glyph.length > 1 ? 22 : 30}
                    size={70}
                    eyeColor={character.eyeColor ?? "var(--ink)"}
                  />
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    lineHeight: 1.25,
                    gap: 4,
                    minWidth: 200,
                  }}
                >
                  <span
                    data-on-paper
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 18,
                      color: "var(--ink)",
                    }}
                  >
                    {character.name}
                  </span>
                  <span
                    data-on-paper-soft
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                      fontSize: 13,
                      color: "var(--ink-soft)",
                      maxWidth: 240,
                      lineHeight: 1.25,
                    }}
                  >
                    {character.passive}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 11,
                      color: "var(--accent-1)",
                      textTransform: "uppercase",
                      marginTop: 4,
                    }}
                  >
                    tap to swap →
                  </span>
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  padding: "8px 4px",
                }}
              >
                <span
                  data-on-paper
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 22,
                    color: "var(--ink)",
                  }}
                >
                  Pick your bean
                </span>
                <span
                  data-on-paper-soft
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "var(--ink-soft)",
                  }}
                >
                  Six operators · pick one to enter the arena
                </span>
              </div>
            )}
          </motion.div>
        </Link>
      </div>

      {/* Stats row */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 15 }}
        style={{
          display: "flex",
          gap: 28,
          padding: "14px 28px",
          background: "var(--cream-deep)",
          border: "4px solid var(--ink)",
          borderRadius: 36,
          boxShadow: "0 5px 0 0 var(--ink)",
          marginBottom: 28,
          flexWrap: "wrap",
          whiteSpace: "nowrap",
        }}
      >
        <Stat label="Rank" value={profile?.rank ?? "—"} accent />
        <Stat label="XP" value={profile ? profile.xp.toLocaleString() : "—"} />
        <Stat
          label="Questions"
          value={profile ? profile.totalQuestions : "—"}
        />
        <Stat
          label="Accuracy"
          value={profile && profile.totalQuestions > 0 ? `${accuracy}%` : "—"}
        />
        <Stat
          label="Best Streak"
          value={profile ? `x${profile.bestStreak}` : "—"}
        />
      </motion.div>

      {/* Mode tiles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {MODES.map((m, i) => (
          <ModeTile
            key={m.slug}
            mode={m}
            index={i}
            hasCharacter={!!character}
          />
        ))}
      </div>

      <p
        style={{
          marginTop: 28,
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 13,
          color: "var(--ink-soft)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        ✦ Tap a tile · [Enter] to start · [Esc] anytime
      </p>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/settings">
          <ChunkyButton size="sm" color="var(--paper)">
            ⚙ Settings
          </ChunkyButton>
        </Link>
        <Link href="/stats">
          <ChunkyButton size="sm" color="var(--paper)">
            ✕ Mistake Log
          </ChunkyButton>
        </Link>
      </div>
    </div>
  );
}

function ModeTile({
  mode,
  index,
  hasCharacter,
}: {
  mode: Mode;
  index: number;
  hasCharacter: boolean;
}) {
  const target = mode.href ?? `/play/${mode.slug}`;
  const requiresChar = !mode.href || mode.href.startsWith("/play");
  const finalHref =
    !hasCharacter && requiresChar
      ? `/select?next=${encodeURIComponent(target)}`
      : target;

  return (
    <Link href={finalHref} style={{ textDecoration: "none" }}>
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{
          delay: 0.15 + index * 0.06,
          type: "spring",
          stiffness: 300,
          damping: 15,
        }}
        whileHover={{
          y: -6,
          rotate: index % 2 === 0 ? -2 : 2,
          scale: 1.03,
        }}
        whileTap={{ y: 4, scale: 0.97, boxShadow: "0 3px 0 0 var(--ink)" }}
        style={{
          background: mode.color,
          color: mode.textColor,
          border: "4px solid var(--ink)",
          borderRadius: 28,
          boxShadow: "0 8px 0 0 var(--ink)",
          padding: "22px 24px 24px",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          minHeight: 180,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <motion.span
            data-glyph-chip
            animate={{ rotate: [-4, 4, -4] }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.2,
            }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 48,
              background: "var(--paper)",
              color: "var(--ink)",
              border: "4px solid var(--ink)",
              borderRadius: 18,
              width: 76,
              height: 76,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 0 0 var(--ink)",
              lineHeight: 1,
            }}
          >
            {mode.glyph}
          </motion.span>
          <Pill>READY</Pill>
        </div>
        <h2
          data-tile-text
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 28,
            color: mode.textColor,
            marginBottom: 6,
            lineHeight: 1.05,
          }}
        >
          {mode.title}
        </h2>
        <p
          data-tile-tagline
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 15,
            color:
              mode.textColor === "var(--on-dark-text)"
                ? "#E5DAFF"
                : "var(--ink-soft)",
            lineHeight: 1.3,
          }}
        >
          {mode.tagline}
        </p>
      </motion.div>
    </Link>
  );
}
