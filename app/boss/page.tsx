"use client";
import Link from "next/link";
import { ALL_TOPICS, TOPIC_META } from "@/lib/topics";

export default function BossSelect() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 border-b border-[var(--color-border)] flex justify-between items-center">
        <Link href="/" className="font-mono text-xs text-[var(--color-fg-dim)] hover:text-[var(--color-accent)] uppercase tracking-widest">
          ← exit
        </Link>
        <h1 className="font-mono text-lg tracking-[0.3em] text-[var(--color-accent)] text-glow">
          BOSS BATTLE — SELECT TOPIC
        </h1>
        <span className="w-12" />
      </header>
      <main className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ALL_TOPICS.map((t) => {
            const meta = TOPIC_META[t];
            return (
              <Link
                key={t}
                href={`/play/boss?topic=${t}`}
                className="group border border-[var(--color-border)] p-5 hover:border-[var(--color-accent)] hover:glow-red transition-all"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-mono uppercase tracking-widest text-[var(--color-accent)] text-glow">{meta.short}</span>
                  <span className="font-mono text-[10px] text-[var(--color-fg-dim)] uppercase tracking-widest">10 rounds</span>
                </div>
                <div className="font-mono text-base group-hover:text-[var(--color-accent)] transition-colors">{meta.label}</div>
                <p className="text-sm text-[var(--color-fg-dim)] mt-1">{meta.tagline}</p>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
