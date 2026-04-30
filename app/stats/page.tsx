"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Profile, HistoryEntry } from "@/lib/profile";
import { ALL_TOPICS, TOPIC_META, type Topic } from "@/lib/topics";
import { Tex } from "@/components/Tex";

export default function StatsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then(setProfile);
    fetch("/api/history").then((r) => r.json()).then((d) => setHistory(d.entries ?? []));
  }, []);

  const wrongs = useMemo(() => history.filter((h) => !h.correct).reverse(), [history]);

  const cheatSheet = useMemo(() => {
    if (!profile) return null;
    // Pick the 3 weakest topics by accuracy (with at least 1 attempt)
    const ranked = ALL_TOPICS
      .map((t) => ({ t, ts: profile.topics[t] }))
      .filter((x) => x.ts.attempts > 0)
      .sort((a, b) => (a.ts.correct / a.ts.attempts) - (b.ts.correct / b.ts.attempts))
      .slice(0, 3)
      .map((x) => x.t);
    return ranked;
  }, [profile]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 border-b border-[var(--color-border)] flex justify-between items-center">
        <Link href="/" className="font-mono text-xs text-[var(--color-fg-dim)] hover:text-[var(--color-accent)] uppercase tracking-widest">
          ← exit
        </Link>
        <h1 className="font-mono text-lg tracking-[0.3em] text-[var(--color-accent)] text-glow">
          PERFORMANCE
        </h1>
        <button
          onClick={() => downloadCheatSheet(profile, history, cheatSheet ?? [])}
          disabled={!profile || (cheatSheet?.length ?? 0) === 0}
          className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] hover:text-glow disabled:opacity-30"
        >
          ⤓ Cheat sheet
        </button>
      </header>

      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full space-y-10">
        <section>
          <h2 className="font-mono uppercase text-xs tracking-widest text-[var(--color-fg-dim)] mb-3">
            Topic mastery
          </h2>
          <div className="space-y-2">
            {ALL_TOPICS.map((t) => {
              const ts = profile?.topics[t];
              const acc = ts && ts.attempts > 0 ? (ts.correct / ts.attempts) : null;
              const meta = TOPIC_META[t];
              return (
                <div key={t} className="border border-[var(--color-border)] p-3">
                  <div className="flex justify-between font-mono text-xs uppercase tracking-widest mb-2">
                    <span className="text-[var(--color-accent)]">{meta.short}</span>
                    <span className="text-[var(--color-fg-dim)]">
                      {ts?.attempts ?? 0} attempts · {acc !== null ? `${Math.round(acc * 100)}%` : "—"}
                    </span>
                  </div>
                  <div className="h-1 bg-[var(--color-border)]">
                    <div
                      className="h-full bg-[var(--color-accent)] transition-[width]"
                      style={{ width: `${(ts?.mastery ?? 0) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-mono uppercase text-xs tracking-widest text-[var(--color-fg-dim)] mb-3">
            Mistake log ({wrongs.length})
          </h2>
          {wrongs.length === 0 ? (
            <p className="text-[var(--color-fg-dim)] text-sm">
              No mistakes recorded — start a run to populate this log.
            </p>
          ) : (
            <div className="space-y-3">
              {wrongs.slice(0, 20).map((h, i) => (
                <div key={i} className="border border-[var(--color-border)] p-4">
                  <div className="flex justify-between font-mono text-xs uppercase tracking-widest mb-2">
                    <span className="text-[var(--color-accent)]">{TOPIC_META[h.topic as Topic].short}</span>
                    <span className="text-[var(--color-fg-dim)]">
                      {h.difficulty} · {new Date(h.ts).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed mb-2">
                    <Tex>{h.prompt}</Tex>
                  </div>
                  <div className="font-mono text-xs grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[var(--color-fg-dim)]">your answer </span>
                      <span className="text-[var(--color-accent)]">{stringify(h.userAnswer)}</span>
                    </div>
                    <div>
                      <span className="text-[var(--color-fg-dim)]">correct </span>
                      <span className="text-[var(--color-success)]">{stringify(h.correctAnswer)}</span>
                    </div>
                  </div>
                  <div className="mt-2 border-l-2 border-[var(--color-accent)] pl-3 text-xs">
                    <span className="text-[var(--color-accent-soft)] font-mono uppercase mr-2">watch out:</span>
                    {h.commonMistake}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function stringify(x: unknown): string {
  if (Array.isArray(x)) return `(${x.join(", ")})`;
  return String(x);
}

function downloadCheatSheet(profile: Profile | null, history: HistoryEntry[], topics: Topic[]) {
  if (!profile || topics.length === 0) return;
  const lines: string[] = [
    "MATH 220 — NIGHT-BEFORE CHEAT SHEET",
    `Generated ${new Date().toLocaleString()}`,
    `Rank: ${profile.rank}  ·  XP: ${profile.xp}  ·  Accuracy: ${Math.round((profile.totalCorrect / Math.max(1, profile.totalQuestions)) * 100)}%`,
    "",
    "WEAKEST TOPICS (focus here):",
    "",
  ];
  for (const t of topics) {
    const meta = TOPIC_META[t];
    const ts = profile.topics[t];
    const acc = ts.attempts > 0 ? Math.round((ts.correct / ts.attempts) * 100) : 0;
    lines.push(`▸ ${meta.label}  —  ${ts.correct}/${ts.attempts}  (${acc}%)`);
    lines.push(`  Tagline: ${meta.tagline}`);
    const mistakes = history.filter((h) => h.topic === t && !h.correct).slice(-3);
    if (mistakes.length) {
      lines.push("  Recent mistakes:");
      for (const m of mistakes) {
        lines.push(`    • ${stripTex(m.prompt).slice(0, 80)}`);
        lines.push(`      ↳ Watch out: ${m.commonMistake}`);
      }
    }
    lines.push("");
  }
  lines.push(`KEY FORMULAS (high-yield):`);
  lines.push(`  Rank-nullity: dim Nul(A) = n - rank(A)   [n = # cols]`);
  lines.push(`  Projection: proj_v(u) = ((u·v)/(v·v)) v`);
  lines.push(`  2x2 char poly: λ² - tr(A)λ + det(A) = 0`);
  lines.push(`  Normal eq: AᵀA x̂ = Aᵀb`);
  lines.push(`  W ⊆ ℝⁿ: dim W + dim W⊥ = n`);
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cheatsheet-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function stripTex(s: string): string {
  return s
    .replace(/\$\$[\s\S]+?\$\$/g, "[matrix]")
    .replace(/\$[^$]+?\$/g, (m) => m.slice(1, -1).replace(/\\[a-zA-Z]+/g, "").replace(/[{}]/g, ""))
    .replace(/\n/g, " ")
    .trim();
}
