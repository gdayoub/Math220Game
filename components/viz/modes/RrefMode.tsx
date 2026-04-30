"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Tex } from "@/components/Tex";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { fmtAugmented } from "@/lib/matrixMath";
import { rrefWithSteps } from "@/lib/viz/rrefSteps";

type Props = {
  augmented: number[][];
  onChange: (m: number[][]) => void;
  reducedMotion: boolean;
};

export function RrefMode({ augmented, onChange, reducedMotion }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [auto, setAuto] = useState(false);

  const { steps, final } = useMemo(() => rrefWithSteps(augmented), [augmented]);

  const totalStops = steps.length + 1; // initial + each step
  const safeIdx = Math.min(stepIdx, totalStops - 1);
  const currentMatrix =
    safeIdx === 0 ? augmented : steps[safeIdx - 1].after;
  const currentStep = safeIdx === 0 ? null : steps[safeIdx - 1];

  // Auto-play through steps.
  useEffect(() => {
    if (!auto) return;
    if (reducedMotion) {
      setStepIdx(totalStops - 1);
      setAuto(false);
      return;
    }
    if (safeIdx >= totalStops - 1) {
      setAuto(false);
      return;
    }
    const id = setTimeout(() => setStepIdx((i) => i + 1), 900);
    return () => clearTimeout(id);
  }, [auto, safeIdx, totalStops, reducedMotion]);

  const setEntry = (i: number, j: number, v: number) => {
    const next = augmented.map((r) => r.slice());
    next[i][j] = v;
    onChange(next);
    setStepIdx(0);
    setAuto(false);
  };

  const reset = () => {
    setStepIdx(0);
    setAuto(false);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 360px)",
        gap: 28,
        alignItems: "start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <section
          data-light-card
          style={{
            background: "var(--paper)",
            border: "4px solid var(--ink)",
            borderRadius: 20,
            boxShadow: "0 6px 0 0 var(--ink)",
            padding: "22px 26px",
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            key={safeIdx}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            data-on-paper
            style={{
              color: "var(--ink)",
              fontSize: 20,
              textAlign: "center",
            }}
          >
            <Tex>{`$$${fmtAugmented(currentMatrix)}$$`}</Tex>
          </motion.div>

          {currentStep && (
            <motion.div
              key={`s-${safeIdx}`}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              data-on-paper
              style={{
                background: "var(--lemon)",
                border: "3px solid var(--ink)",
                borderRadius: 14,
                boxShadow: "0 4px 0 0 var(--ink)",
                padding: "10px 16px",
                fontFamily: "var(--font-display)",
                color: "var(--ink)",
                fontSize: 16,
              }}
            >
              <Tex>{`$${currentStep.latex}$`}</Tex>
            </motion.div>
          )}
          {!currentStep && (
            <p
              data-on-paper
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 12,
                color: "var(--ink-soft)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Initial augmented matrix
            </p>
          )}
        </section>

        <section
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <ChunkyButton
            size="sm"
            color="var(--paper)"
            onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
            disabled={safeIdx === 0}
          >
            ← Prev
          </ChunkyButton>
          <ChunkyButton
            size="sm"
            color="var(--lemon)"
            onClick={() => setStepIdx((i) => Math.min(totalStops - 1, i + 1))}
            disabled={safeIdx >= totalStops - 1}
          >
            Next →
          </ChunkyButton>
          <ChunkyButton
            size="sm"
            color="var(--mint)"
            onClick={() => {
              setAuto((p) => !p);
            }}
            disabled={reducedMotion || totalStops <= 1}
          >
            {auto ? "Pause" : "Auto-play"}
          </ChunkyButton>
          <ChunkyButton size="sm" color="var(--paper)" onClick={reset}>
            Reset
          </ChunkyButton>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 12,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Step {safeIdx} / {totalStops - 1}
          </span>
        </section>

        <section
          data-light-card
          style={{
            background: "var(--paper)",
            border: "4px solid var(--ink)",
            borderRadius: 20,
            boxShadow: "0 5px 0 0 var(--ink)",
            padding: "14px 18px",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          <p data-on-paper style={{ color: "var(--ink)" }}>
            <Tex>
              {`Final RREF: $${fmtAugmented(final)}$`}
            </Tex>
          </p>
        </section>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <section
          data-light-card
          style={{
            background: "var(--paper)",
            border: "4px solid var(--ink)",
            borderRadius: 20,
            boxShadow: "0 5px 0 0 var(--ink)",
            padding: "16px 18px",
          }}
        >
          <h3
            data-on-paper
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 12,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 12,
            }}
          >
            Augmented matrix
          </h3>
          <AugmentedGrid matrix={augmented} onChange={setEntry} />
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <ChunkyButton
              size="sm"
              color="var(--cream-deep)"
              onClick={() => {
                onChange([
                  [1, 2, 3, 4],
                  [2, 4, 6, 8],
                  [1, 1, 1, 1],
                ]);
                setStepIdx(0);
              }}
            >
              Sample
            </ChunkyButton>
            <ChunkyButton
              size="sm"
              color="var(--cream-deep)"
              onClick={() => {
                onChange([
                  [1, 1, 1, 6],
                  [0, 2, 1, 8],
                  [2, 1, 0, 5],
                ]);
                setStepIdx(0);
              }}
            >
              Random-ish
            </ChunkyButton>
          </div>
        </section>
      </div>
    </div>
  );
}

function AugmentedGrid({
  matrix,
  onChange,
}: {
  matrix: number[][];
  onChange: (i: number, j: number, v: number) => void;
}) {
  const cols = matrix[0].length;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols - 1}, 1fr) 4px 1fr`,
        gap: 6,
        alignItems: "center",
      }}
    >
      {matrix.flatMap((row, i) =>
        row.map((val, j) =>
          j === cols - 1 ? (
            [
              <div
                key={`bar-${i}`}
                style={{
                  width: 3,
                  height: 30,
                  background: "var(--ink)",
                  margin: "0 2px",
                  gridColumn: cols,
                }}
              />,
              <input
                key={`${i}-${j}`}
                type="number"
                step={1}
                value={val}
                onChange={(e) => onChange(i, j, parseFloat(e.target.value || "0"))}
                style={cellStyle}
              />,
            ]
          ) : (
            <input
              key={`${i}-${j}`}
              type="number"
              step={1}
              value={val}
              onChange={(e) => onChange(i, j, parseFloat(e.target.value || "0"))}
              style={cellStyle}
            />
          ),
        ),
      )}
    </div>
  );
}

const cellStyle = {
  background: "var(--cream-deep)",
  border: "2px solid var(--ink)",
  borderRadius: 8,
  boxShadow: "0 2px 0 0 var(--ink)",
  padding: "6px 8px",
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: 14,
  color: "var(--ink)",
  textAlign: "center" as const,
  minWidth: 0,
  width: "100%",
};
