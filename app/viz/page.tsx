"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { TransformCanvas } from "@/components/viz/TransformCanvas";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { ThemePicker } from "@/components/ui/ThemePicker";

type Mat2 = [[number, number], [number, number]];

const PRESETS: Array<{
  label: string;
  matrix: Mat2;
  concept: string;
  color: string;
}> = [
  {
    label: "Identity",
    matrix: [[1, 0], [0, 1]],
    concept: "Does nothing — eigvals 1, 1.",
    color: "var(--paper)",
  },
  {
    label: "Rotate 90°",
    matrix: [[0, -1], [1, 0]],
    concept: "Pure rotation — no real eigenvectors. det = 1.",
    color: "var(--sky)",
  },
  {
    label: "Reflect X",
    matrix: [[1, 0], [0, -1]],
    concept: "Reflection across x-axis. det = -1 (orientation flips).",
    color: "var(--pink)",
  },
  {
    label: "Scale ×2",
    matrix: [[2, 0], [0, 2]],
    concept: "Uniform scaling. Every direction is an eigenvector with λ=2.",
    color: "var(--mint)",
  },
  {
    label: "Shear",
    matrix: [[1, 1], [0, 1]],
    concept: "Horizontal shear — defective: only one eigenvector direction.",
    color: "var(--lemon)",
  },
  {
    label: "Stretch",
    matrix: [[3, 0], [0, 1]],
    concept: "Anisotropic scaling. det = area scaling factor = 3.",
    color: "var(--peach)",
  },
  {
    label: "Singular",
    matrix: [[1, 2], [2, 4]],
    concept: "Rank 1 → collapses to a line. det = 0.",
    color: "var(--grape)",
  },
];

export default function VizPage() {
  const [M, setM] = useState<Mat2>([[1, 0], [0, 1]]);
  const [predicted, setPredicted] = useState(false);
  const [showFull, setShowFull] = useState(true);

  function setEntry(i: number, j: number, v: number) {
    const next: Mat2 = [
      [M[0][0], M[0][1]],
      [M[1][0], M[1][1]],
    ];
    next[i][j] = v;
    setM(next);
    setPredicted(false);
    setShowFull(false);
  }

  const matchedPreset = PRESETS.find((p) => matEq(p.matrix, M));

  return (
    <>
      <ScreenShell
        title="Visualization"
        subtitle="See the transformation breathe. Predict the output before reveal."
        glyph="✶"
        accent="var(--sky)"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, auto) minmax(280px, 1fr)",
            gap: 28,
            alignItems: "start",
          }}
        >
          {/* Canvas + reveal */}
          <div>
            <TransformCanvas
              matrix={M}
              showEigen={showFull}
              showDetArea={showFull}
            />
            {!showFull && (
              <div
                data-light-card
                style={{
                  marginTop: 16,
                  background: "var(--paper)",
                  border: "4px solid var(--ink)",
                  borderRadius: 20,
                  boxShadow: "0 5px 0 0 var(--ink)",
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <p
                  data-on-paper
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--ink)",
                    lineHeight: 1.4,
                  }}
                >
                  Predict: how will the unit square transform? What will det be?
                </p>
                <ChunkyButton
                  color="var(--lemon)"
                  onClick={() => {
                    setPredicted(true);
                    setShowFull(true);
                  }}
                >
                  Reveal eigenvectors & det
                </ChunkyButton>
              </div>
            )}
            {predicted && (
              <p
                style={{
                  marginTop: 14,
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 12,
                  color: "var(--accent-1)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                ✦ Compare your guess to the eigenvector directions and det above.
              </p>
            )}
          </div>

          {/* Controls */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            <section
              data-light-card
              style={{
                background: "var(--paper)",
                border: "4px solid var(--ink)",
                borderRadius: 24,
                boxShadow: "0 7px 0 0 var(--ink)",
                padding: "20px 22px",
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
                Matrix entries
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 14,
                }}
              >
                {[0, 1].flatMap((i) =>
                  [0, 1].map((j) => (
                    <label
                      key={`${i}${j}`}
                      data-on-paper
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: 11,
                        color: "var(--ink-soft)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      <span>
                        a[{i}][{j}]
                      </span>
                      <input
                        type="range"
                        min={-3}
                        max={3}
                        step={0.5}
                        value={M[i][j]}
                        onChange={(e) =>
                          setEntry(i, j, parseFloat(e.target.value))
                        }
                        style={{ accentColor: "var(--grape)" }}
                      />
                      <input
                        type="number"
                        step={0.5}
                        value={M[i][j]}
                        onChange={(e) =>
                          setEntry(i, j, parseFloat(e.target.value || "0"))
                        }
                        style={{
                          background: "var(--cream-deep)",
                          border: "3px solid var(--ink)",
                          borderRadius: 12,
                          boxShadow: "0 3px 0 0 var(--ink)",
                          padding: "8px 12px",
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: 16,
                          color: "var(--ink)",
                        }}
                      />
                    </label>
                  )),
                )}
              </div>
            </section>

            <section>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 10,
                }}
              >
                Presets
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                {PRESETS.map((p, i) => (
                  <motion.button
                    key={p.label}
                    type="button"
                    whileHover={{ y: -2, rotate: i % 2 === 0 ? -2 : 2 }}
                    whileTap={{ y: 2, scale: 0.96 }}
                    onClick={() => {
                      setM(p.matrix);
                      setShowFull(false);
                      setPredicted(false);
                    }}
                    style={{
                      background: p.color,
                      border: "3px solid var(--ink)",
                      borderRadius: 999,
                      boxShadow: "0 4px 0 0 var(--ink)",
                      padding: "8px 14px",
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 12,
                      color:
                        p.color === "var(--grape)"
                          ? "var(--on-dark-text)"
                          : "var(--ink)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      cursor: "pointer",
                    }}
                  >
                    {p.label}
                  </motion.button>
                ))}
              </div>
              <p
                style={{
                  marginTop: 14,
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--ink-soft)",
                  lineHeight: 1.4,
                }}
              >
                {matchedPreset?.concept ??
                  "Custom matrix — examine det (area scaling) and eigenvectors (invariant directions)."}
              </p>
            </section>

            <section
              style={{
                background: "var(--cream-deep)",
                border: "4px solid var(--ink)",
                borderRadius: 20,
                boxShadow: "0 5px 0 0 var(--ink)",
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 14,
                color: "var(--ink)",
                lineHeight: 1.4,
              }}
            >
              <p>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 11,
                    color: "var(--accent-2)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginRight: 6,
                  }}
                >
                  det
                </span>
                = signed area scaling. Negative = orientation flipped.
              </p>
              <p>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 11,
                    color: "var(--accent-2)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginRight: 6,
                  }}
                >
                  purple lines
                </span>
                = eigenvector directions. Vectors along these lines stay on the
                same line after transformation.
              </p>
              <p>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 11,
                    color: "var(--accent-2)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginRight: 6,
                  }}
                >
                  no eigenvectors
                </span>
                shown = complex eigenvalues (the matrix is rotating, not just
                stretching).
              </p>
            </section>
          </div>
        </div>
      </ScreenShell>
      <ThemePicker />
    </>
  );
}

function matEq(a: Mat2, b: Mat2) {
  return (
    a[0][0] === b[0][0] &&
    a[0][1] === b[0][1] &&
    a[1][0] === b[1][0] &&
    a[1][1] === b[1][1]
  );
}
