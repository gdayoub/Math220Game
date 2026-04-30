"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Profile, HistoryEntry } from "@/lib/profile";
import { ALL_TOPICS, TOPIC_META, type Topic } from "@/lib/topics";
import { Tex } from "@/components/Tex";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { Pill } from "@/components/ui/Pill";
import { ThemePicker } from "@/components/ui/ThemePicker";

const TOPIC_COLORS: Record<Topic, string> = {
  rref: "var(--mint)",
  independence: "var(--sky)",
  basis: "var(--peach)",
  eigen: "var(--grape)",
  orthogonality: "var(--pink)",
  leastSquares: "var(--lemon)",
  matrixOps: "var(--mint)",
};

export default function StatsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfile);
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setHistory(d.entries ?? []));
  }, []);

  const wrongs = useMemo(
    () => history.filter((h) => !h.correct).reverse(),
    [history],
  );

  const cheatSheet = useMemo(() => {
    if (!profile) return null;
    return ALL_TOPICS.map((t) => ({ t, ts: profile.topics[t] }))
      .filter((x) => x.ts.attempts > 0)
      .sort((a, b) => a.ts.correct / a.ts.attempts - b.ts.correct / b.ts.attempts)
      .slice(0, 3)
      .map((x) => x.t);
  }, [profile]);

  return (
    <>
      <ScreenShell
        title="Performance"
        subtitle="Topic mastery, mistake log, cheat sheet — your blind spots, surfaced."
        glyph="★"
        accent="var(--peach)"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 18,
          }}
        >
          <ChunkyButton
            color="var(--lemon)"
            size="sm"
            disabled={!profile || (cheatSheet?.length ?? 0) === 0}
            onClick={() =>
              downloadCheatSheet(profile, history, cheatSheet ?? [])
            }
          >
            ⤓ Cheat sheet
          </ChunkyButton>
        </div>

        {/* Topic mastery */}
        <section style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 14,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 14,
            }}
          >
            Topic mastery
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {ALL_TOPICS.map((t, i) => {
              const ts = profile?.topics[t];
              const acc =
                ts && ts.attempts > 0 ? ts.correct / ts.attempts : null;
              const meta = TOPIC_META[t];
              const color = TOPIC_COLORS[t];
              const mastery = ts?.mastery ?? 0;
              return (
                <motion.div
                  key={t}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: i * 0.04,
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  }}
                  data-light-card
                  style={{
                    background: "var(--paper)",
                    border: "4px solid var(--ink)",
                    borderRadius: 22,
                    boxShadow: "0 6px 0 0 var(--ink)",
                    padding: "16px 18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <Pill
                      color={color}
                      textColor={
                        color === "var(--grape)"
                          ? "var(--cream)"
                          : "var(--ink)"
                      }
                    >
                      {meta.short}
                    </Pill>
                    <span
                      data-on-paper-soft
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: 11,
                        color: "var(--ink-soft)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {ts?.attempts ?? 0} attempts ·{" "}
                      {acc !== null ? `${Math.round(acc * 100)}%` : "—"}
                    </span>
                  </div>
                  <div
                    data-on-paper
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 16,
                      color: "var(--ink)",
                      marginBottom: 10,
                    }}
                  >
                    {meta.label}
                  </div>
                  <div
                    style={{
                      height: 16,
                      background: "var(--cream-deep)",
                      border: "3px solid var(--ink)",
                      borderRadius: 999,
                      overflow: "hidden",
                      boxShadow: "0 2px 0 0 var(--ink)",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${mastery * 100}%` }}
                      transition={{
                        delay: 0.2 + i * 0.04,
                        type: "spring",
                        stiffness: 200,
                        damping: 18,
                      }}
                      style={{ height: "100%", background: color }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Mistake log */}
        <section>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 14,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 14,
            }}
          >
            Mistake log ({wrongs.length})
          </h2>
          {wrongs.length === 0 ? (
            <div
              data-light-card
              style={{
                background: "var(--paper)",
                border: "4px solid var(--ink)",
                borderRadius: 22,
                boxShadow: "0 6px 0 0 var(--ink)",
                padding: "20px 22px",
              }}
            >
              <p
                data-on-paper-soft
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--ink-soft)",
                }}
              >
                No mistakes recorded — start a run to populate this log.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {wrongs.slice(0, 20).map((h, i) => {
                const color = TOPIC_COLORS[h.topic as Topic];
                return (
                  <motion.div
                    key={i}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    data-light-card
                    style={{
                      background: "var(--paper)",
                      border: "4px solid var(--ink)",
                      borderRadius: 22,
                      boxShadow: "0 6px 0 0 var(--ink)",
                      padding: "18px 20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <Pill
                        color={color}
                        textColor={
                          color === "var(--grape)"
                            ? "var(--cream)"
                            : "var(--ink)"
                        }
                      >
                        {TOPIC_META[h.topic as Topic].short}
                      </Pill>
                      <span
                        data-on-paper-soft
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: 11,
                          color: "var(--ink-soft)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {h.difficulty} · {new Date(h.ts).toLocaleString()}
                      </span>
                    </div>
                    <div
                      data-on-paper
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        fontSize: 15,
                        color: "var(--ink)",
                        lineHeight: 1.4,
                        marginBottom: 12,
                      }}
                    >
                      <Tex>{h.prompt}</Tex>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: 13,
                      }}
                    >
                      <div data-on-paper>
                        <span
                          data-on-paper-soft
                          style={{
                            color: "var(--ink-soft)",
                            marginRight: 6,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontSize: 10,
                          }}
                        >
                          Your answer
                        </span>
                        <span style={{ color: "var(--pink-deep)" }}>
                          {stringify(h.userAnswer)}
                        </span>
                      </div>
                      <div data-on-paper>
                        <span
                          data-on-paper-soft
                          style={{
                            color: "var(--ink-soft)",
                            marginRight: 6,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontSize: 10,
                          }}
                        >
                          Correct
                        </span>
                        <span style={{ color: "var(--mint-deep)" }}>
                          {stringify(h.correctAnswer)}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        padding: "10px 14px",
                        background: "var(--lemon)",
                        border: "3px solid var(--ink)",
                        borderRadius: 14,
                        boxShadow: "0 3px 0 0 var(--ink)",
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        fontSize: 13,
                        color: "var(--ink)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          marginRight: 8,
                        }}
                      >
                        Watch out:
                      </span>
                      {h.commonMistake}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </ScreenShell>
      <ThemePicker />
    </>
  );
}

function stringify(x: unknown): string {
  if (Array.isArray(x)) return `(${x.join(", ")})`;
  return String(x);
}

function downloadCheatSheet(
  profile: Profile | null,
  history: HistoryEntry[],
  topics: Topic[],
) {
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
    const acc =
      ts.attempts > 0 ? Math.round((ts.correct / ts.attempts) * 100) : 0;
    lines.push(`▸ ${meta.label}  —  ${ts.correct}/${ts.attempts}  (${acc}%)`);
    lines.push(`  Tagline: ${meta.tagline}`);
    const mistakes = history
      .filter((h) => h.topic === t && !h.correct)
      .slice(-3);
    if (mistakes.length) {
      lines.push("  Recent mistakes:");
      for (const m of mistakes) {
        lines.push(`    • ${stripTex(m.prompt).slice(0, 80)}`);
        lines.push(`      ↳ Watch out: ${m.commonMistake}`);
      }
    }
    lines.push("");
  }
  lines.push("KEY FORMULAS (high-yield):");
  lines.push("  Rank-nullity: dim Nul(A) = n - rank(A)   [n = # cols]");
  lines.push("  Projection: proj_v(u) = ((u·v)/(v·v)) v");
  lines.push("  2x2 char poly: λ² - tr(A)λ + det(A) = 0");
  lines.push("  Normal eq: AᵀA x̂ = Aᵀb");
  lines.push("  W ⊆ ℝⁿ: dim W + dim W⊥ = n");
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
    .replace(/\$[^$]+?\$/g, (m) =>
      m
        .slice(1, -1)
        .replace(/\\[a-zA-Z]+/g, "")
        .replace(/[{}]/g, ""),
    )
    .replace(/\n/g, " ")
    .trim();
}
