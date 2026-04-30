"use client";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TOPIC_META, ALL_TOPICS, type Topic } from "@/lib/topics";
import { TOPIC_CONTENT } from "@/lib/topicContent";
import type { HistoryEntry } from "@/lib/profile";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { Pill } from "@/components/ui/Pill";
import { ThemePicker } from "@/components/ui/ThemePicker";
import { Tex } from "@/components/Tex";

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

export default function ReviewTopic({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: topicParam } = use(params);
  const topic = topicParam as Topic;
  const isValid = (ALL_TOPICS as string[]).includes(topic);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setHistory(d.entries ?? []));
  }, []);

  const recentMistakes = useMemo(
    () =>
      history
        .filter((h) => h.topic === topic && !h.correct)
        .slice(-3)
        .reverse(),
    [history, topic],
  );

  if (!isValid) {
    return (
      <ScreenShell title="Review" glyph="?" accent="var(--pink)">
        <div
          data-light-card
          style={{
            background: "var(--paper)",
            border: "4px solid var(--ink)",
            borderRadius: 24,
            boxShadow: "0 6px 0 0 var(--ink)",
            padding: "24px 28px",
          }}
        >
          <p
            data-on-paper
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 16,
              color: "var(--ink)",
            }}
          >
            Unknown topic. <Link href="/review">← Back to Review</Link>
          </p>
        </div>
      </ScreenShell>
    );
  }

  const meta = TOPIC_META[topic];
  const decor = TOPIC_DECOR[topic];
  const content = TOPIC_CONTENT[topic];

  return (
    <>
      <ScreenShell
        title={meta.label}
        subtitle={meta.tagline}
        glyph={decor.glyph}
        accent={decor.color}
        backHref="/review"
        backLabel="← Review"
      >
        {/* Blurb card */}
        <motion.section
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          data-light-card
          style={{
            background: "var(--paper)",
            border: "4px solid var(--ink)",
            borderRadius: 24,
            boxShadow: "0 7px 0 0 var(--ink)",
            padding: "22px 26px",
            marginBottom: 22,
          }}
        >
          <p
            data-on-paper
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 17,
              color: "var(--ink)",
              lineHeight: 1.55,
            }}
          >
            <Tex>{content.blurb}</Tex>
          </p>
        </motion.section>

        {/* Formulas */}
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 14,
            color: "var(--ink-soft)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          Key formulas
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
            marginBottom: 28,
          }}
        >
          {content.formulas.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: i * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 15,
              }}
              data-light-card
              style={{
                background: "var(--paper)",
                border: "4px solid var(--ink)",
                borderRadius: 18,
                boxShadow: "0 5px 0 0 var(--ink)",
                padding: "14px 18px",
              }}
            >
              <div
                data-on-paper-soft
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 11,
                  color: "var(--ink-soft)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                }}
              >
                <Tex>{f.label}</Tex>
              </div>
              <div
                data-on-paper
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "var(--ink)",
                  lineHeight: 1.4,
                  textAlign: "center",
                  padding: "6px 4px",
                }}
              >
                <Tex>{`$$${f.body}$$`}</Tex>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Worked example */}
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 14,
            color: "var(--ink-soft)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          Worked example
        </h2>
        <motion.section
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          data-light-card
          style={{
            background: "var(--paper)",
            border: "4px solid var(--ink)",
            borderRadius: 24,
            boxShadow: "0 7px 0 0 var(--ink)",
            padding: "22px 26px",
            marginBottom: 28,
          }}
        >
          <h3
            data-on-paper
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 18,
              color: "var(--ink)",
              marginBottom: 14,
            }}
          >
            <Tex>{content.example.title}</Tex>
          </h3>
          <ol
            data-on-paper
            style={{
              listStyle: "decimal",
              paddingLeft: 22,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 15,
              color: "var(--ink)",
              lineHeight: 1.55,
            }}
          >
            {content.example.steps.map((s, i) => (
              <li key={i}>
                <Tex>{s}</Tex>
              </li>
            ))}
          </ol>
        </motion.section>

        {/* Pitfall */}
        <motion.section
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          style={{
            background: "var(--lemon)",
            border: "4px solid var(--ink)",
            borderRadius: 22,
            boxShadow: "0 6px 0 0 var(--ink)",
            padding: "18px 22px",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 11,
              color: "var(--ink)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 6,
            }}
          >
            Watch out
          </div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 16,
              color: "var(--ink)",
              lineHeight: 1.45,
            }}
          >
            <Tex>{content.pitfall}</Tex>
          </p>
        </motion.section>

        {/* Recent mistakes from this topic, if any */}
        {recentMistakes.length > 0 && (
          <>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 14,
                color: "var(--ink-soft)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 12,
              }}
            >
              Your recent misses
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 28,
              }}
            >
              {recentMistakes.map((m, i) => (
                <div
                  key={i}
                  data-light-card
                  style={{
                    background: "var(--paper)",
                    border: "4px solid var(--ink)",
                    borderRadius: 18,
                    boxShadow: "0 5px 0 0 var(--ink)",
                    padding: "14px 18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <Pill>{m.difficulty.toUpperCase()}</Pill>
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
                      {new Date(m.ts).toLocaleDateString()}
                    </span>
                  </div>
                  <p
                    data-on-paper-soft
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                      fontSize: 13,
                      color: "var(--ink-soft)",
                      lineHeight: 1.45,
                    }}
                  >
                    ↳ {m.commonMistake}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Drill CTA */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 14,
            paddingTop: 8,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 13,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Ready to apply it? Run a 10-question gauntlet on this topic.
          </p>
          <Link href={`/play/boss?topic=${topic}`}>
            <ChunkyButton color="var(--lemon)">Drill this topic ⚔</ChunkyButton>
          </Link>
        </div>
      </ScreenShell>
      <ThemePicker />
    </>
  );
}
