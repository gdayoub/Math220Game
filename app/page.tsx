"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Profile } from "@/lib/profile";
import { useClient } from "@/lib/clientStore";
import { getCharacter } from "@/lib/characters";
import { BootGate } from "@/components/effects/BootSequence";
import { GlitchText } from "@/components/effects/GlitchText";
import { TiltCard } from "@/components/effects/TiltCard";
import { AnimatedCounter } from "@/components/effects/AnimatedCounter";

const MODES = [
  {
    slug: "survival",
    title: "Survival",
    glyph: "⚔",
    tagline: "Three lives. Difficulty climbs. Don't blink.",
  },
  {
    slug: "weakness",
    title: "Weakness Training",
    glyph: "◎",
    tagline: "The AI hunts your blind spots. Targeted practice.",
  },
  {
    slug: "speed",
    title: "Speed Run",
    glyph: "↯",
    tagline: "Ten questions. Beat the clock. Rack the streak.",
  },
  {
    slug: "boss",
    title: "Boss Battle",
    glyph: "▲",
    tagline: "Pick a topic. Ten escalating problems. No mercy.",
    href: "/boss",
  },
  {
    slug: "viz",
    title: "Visualization",
    glyph: "✶",
    tagline: "See transformations breathe. Predict before reveal.",
    href: "/viz",
  },
];

export default function HomePage() {
  return (
    <BootGate>
      <HomeBody />
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col"
    >
      <header className="px-8 py-6 border-b border-[var(--color-border)] flex justify-between items-end gap-6 flex-wrap">
        <div>
          <GlitchText
            as="h1"
            className="font-mono text-3xl tracking-[0.4em] text-[var(--color-accent)] text-glow"
          >
            MATH 220 // ARENA
          </GlitchText>
          <p className="text-[var(--color-fg-dim)] text-xs mt-1 font-mono uppercase tracking-widest">
            Linear Algebra Adaptive Training System · v1.0
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Link
            href="/stats"
            className="font-mono text-xs uppercase tracking-widest text-[var(--color-fg-dim)] hover:text-[var(--color-accent)] transition-colors"
          >
            performance →
          </Link>
        </div>
      </header>

      {/* Operator strip */}
      <section className="px-8 py-4 border-b border-[var(--color-border)] flex justify-between items-center gap-4 flex-wrap">
        <Link
          href="/select?next=/"
          className="group flex items-center gap-4 cursor-pointer"
        >
          {character ? (
            <>
              <div
                className="w-12 h-12 border-2 flex items-center justify-center font-mono text-2xl group-hover:scale-110 transition-transform"
                style={{
                  color: character.color,
                  borderColor: character.color,
                  boxShadow: `0 0 16px ${character.color}55`,
                  textShadow: `0 0 12px ${character.color}`,
                }}
              >
                {character.glyph}
              </div>
              <div>
                <div
                  className="font-mono text-sm tracking-widest"
                  style={{ color: character.color }}
                >
                  {character.name}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-fg-dim)]">
                  {character.passive}
                </div>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-fg-dim)] ml-2 group-hover:text-[var(--color-accent)]">
                [change]
              </span>
            </>
          ) : (
            <div className="font-mono text-sm uppercase tracking-widest text-[var(--color-accent)] text-glow border border-[var(--color-accent)] px-4 py-2 group-hover:bg-[color:var(--color-accent)]/10 transition-colors">
              ▸ SELECT OPERATOR
            </div>
          )}
        </Link>

        <div className="flex flex-wrap gap-8 font-mono text-sm">
          <Stat label="RANK" value={profile?.rank ?? "—"} accent />
          <Stat label="XP" value={profile ? <AnimatedCounter value={profile.xp} /> : "—"} />
          <Stat label="QUESTIONS" value={profile ? <AnimatedCounter value={profile.totalQuestions} /> : "—"} />
          <Stat
            label="ACCURACY"
            value={
              profile && profile.totalQuestions > 0
                ? `${Math.round((profile.totalCorrect / profile.totalQuestions) * 100)}%`
                : "—"
            }
          />
          <Stat label="BEST STREAK" value={profile ? `x${profile.bestStreak}` : "—"} />
        </div>
      </section>

      <main className="flex-1 px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODES.map((m, i) => (
            <ModeTile key={m.slug} {...m} index={i} hasCharacter={!!character} />
          ))}
        </div>
        <p className="mt-10 text-xs text-[var(--color-fg-dim)] font-mono uppercase tracking-widest">
          // [TAB] navigate · [ENTER] select · [ESC] exit any mode
        </p>
      </main>
    </motion.div>
  );
}

function ModeTile({
  slug,
  title,
  glyph,
  tagline,
  href,
  index,
  hasCharacter,
}: {
  slug: string;
  title: string;
  glyph: string;
  tagline: string;
  href?: string;
  index: number;
  hasCharacter: boolean;
}) {
  const target = href ?? `/play/${slug}`;
  // Force operator selection before entering a play mode (viz/boss menu always allowed)
  const requiresChar = !href || href.startsWith("/play");
  const finalHref = !hasCharacter && requiresChar
    ? `/select?next=${encodeURIComponent(target)}`
    : target;

  return (
    <Link href={finalHref}>
      <TiltCard className="block tile-in" intensity={6}>
        <div
          style={{ animationDelay: `${index * 80}ms` }}
          className="group h-full border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:glow-red bg-[var(--color-bg-elevated)] p-6 transition-colors duration-150 cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-4xl text-[var(--color-accent)] text-glow group-hover:scale-110 transition-transform">
              {glyph}
            </span>
            <span className="font-mono text-[10px] tracking-widest text-[var(--color-fg-dim)] group-hover:text-[var(--color-accent)] transition-colors">
              READY
            </span>
          </div>
          <GlitchText
            as="h2"
            className="font-mono text-lg uppercase tracking-widest mb-2 group-hover:text-[var(--color-accent)] transition-colors"
          >
            {title}
          </GlitchText>
          <p className="text-sm text-[var(--color-fg-dim)] leading-relaxed">{tagline}</p>
          {/* Corner brackets */}
          <span className="absolute top-2 left-2 w-3 h-3 border-l border-t border-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="absolute top-2 right-2 w-3 h-3 border-r border-t border-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </TiltCard>
    </Link>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] tracking-widest text-[var(--color-fg-dim)]">{label}</span>
      <span className={`text-xl font-mono ${accent ? "text-[var(--color-accent)] text-glow" : ""}`}>
        {value}
      </span>
    </div>
  );
}
