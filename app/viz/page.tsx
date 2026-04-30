"use client";
import { useState } from "react";
import Link from "next/link";
import { TransformCanvas } from "@/components/viz/TransformCanvas";
import { Button } from "@/components/ui/Button";

type Mat2 = [[number, number], [number, number]];

const PRESETS: Array<{ label: string; matrix: Mat2; concept: string }> = [
  { label: "Identity", matrix: [[1, 0], [0, 1]], concept: "Does nothing — eigvals 1, 1." },
  { label: "Rotation 90°", matrix: [[0, -1], [1, 0]], concept: "Pure rotation — no real eigenvectors. det = 1." },
  { label: "Reflect x-axis", matrix: [[1, 0], [0, -1]], concept: "Reflection across x-axis. det = -1 (orientation flips)." },
  { label: "Scale ×2", matrix: [[2, 0], [0, 2]], concept: "Uniform scaling. Every direction is an eigenvector with λ=2." },
  { label: "Shear", matrix: [[1, 1], [0, 1]], concept: "Horizontal shear — defective: only one eigenvector direction." },
  { label: "Stretch", matrix: [[3, 0], [0, 1]], concept: "Anisotropic scaling. det = area scaling factor = 3." },
  { label: "Singular", matrix: [[1, 2], [2, 4]], concept: "Rank 1 → collapses to a line. det = 0." },
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 border-b border-[var(--color-border)] flex justify-between items-center">
        <Link href="/" className="font-mono text-xs text-[var(--color-fg-dim)] hover:text-[var(--color-accent)] uppercase tracking-widest">
          ← exit
        </Link>
        <h1 className="font-mono text-lg tracking-[0.3em] text-[var(--color-accent)] text-glow">
          VISUALIZATION
        </h1>
        <span className="font-mono text-xs text-[var(--color-fg-dim)] uppercase tracking-widest">
          predict → reveal
        </span>
      </header>

      <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 items-start">
          <div>
            <TransformCanvas matrix={M} showEigen={showFull} showDetArea={showFull} />
            {!showFull && (
              <div className="mt-4 flex flex-col gap-2">
                <p className="text-sm text-[var(--color-fg-dim)]">
                  Predict: how will the unit square transform? What will det be?
                </p>
                <Button onClick={() => { setPredicted(true); setShowFull(true); }}>
                  Reveal eigenvectors & det
                </Button>
              </div>
            )}
            {predicted && (
              <p className="mt-3 text-xs text-[var(--color-accent)] font-mono uppercase tracking-widest">
                ▸ Compare your guess to the eigenvector directions and det value above.
              </p>
            )}
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="font-mono uppercase text-xs tracking-widest text-[var(--color-fg-dim)] mb-3">
                Matrix entries
              </h2>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                {[0, 1].flatMap((i) =>
                  [0, 1].map((j) => (
                    <label key={`${i}${j}`} className="flex flex-col gap-1 font-mono text-xs">
                      <span className="text-[var(--color-fg-dim)]">a[{i}][{j}]</span>
                      <input
                        type="range"
                        min={-3}
                        max={3}
                        step={0.5}
                        value={M[i][j]}
                        onChange={(e) => setEntry(i, j, parseFloat(e.target.value))}
                        className="accent-[var(--color-accent)]"
                      />
                      <input
                        type="number"
                        step={0.5}
                        value={M[i][j]}
                        onChange={(e) => setEntry(i, j, parseFloat(e.target.value || "0"))}
                        className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] px-2 py-1 font-mono"
                      />
                    </label>
                  )),
                )}
              </div>
            </section>

            <section>
              <h2 className="font-mono uppercase text-xs tracking-widest text-[var(--color-fg-dim)] mb-3">
                Presets
              </h2>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => { setM(p.matrix); setShowFull(false); setPredicted(false); }}
                    className="px-3 py-1 border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] font-mono text-xs uppercase tracking-widest transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-[var(--color-fg-dim)] leading-relaxed">
                {PRESETS.find((p) => matEq(p.matrix, M))?.concept ??
                  "Custom matrix — examine det (area scaling) and eigenvectors (invariant directions)."}
              </p>
            </section>

            <section className="border border-[var(--color-border)] p-4 text-sm space-y-2 leading-relaxed">
              <p>
                <span className="text-[var(--color-accent)] font-mono uppercase text-xs tracking-widest">det </span>
                = signed area scaling. Negative = orientation flipped (reflection somewhere).
              </p>
              <p>
                <span className="text-[var(--color-accent)] font-mono uppercase text-xs tracking-widest">red lines </span>
                = eigenvector directions. Vectors along these lines stay on the same line after transformation.
              </p>
              <p>
                <span className="text-[var(--color-accent)] font-mono uppercase text-xs tracking-widest">no eigenvectors </span>
                shown = complex eigenvalues (the matrix is rotating, not just stretching).
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function matEq(a: Mat2, b: Mat2) {
  return a[0][0] === b[0][0] && a[0][1] === b[0][1] && a[1][0] === b[1][0] && a[1][1] === b[1][1];
}
