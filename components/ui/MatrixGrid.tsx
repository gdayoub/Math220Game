"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  rows: number;
  cols: number;
  /** Called with a 2D array of strings (or 1D when rows === 1 || cols === 1). */
  onChange: (value: unknown) => void;
  /** When the question id changes, cells reset. */
  resetKey: string | number;
};

export function MatrixGrid({ rows, cols, onChange, resetKey }: Props) {
  const total = rows * cols;
  const [cells, setCells] = useState<string[]>(() => Array(total).fill(""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setCells(Array(total).fill(""));
    refs.current = [];
    setTimeout(() => refs.current[0]?.focus(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, total]);

  function set(i: number, v: string) {
    const next = cells.slice();
    next[i] = v;
    setCells(next);
    // Emit shape: 1D array if rows or cols is 1, otherwise 2D
    const shape: unknown =
      rows === 1 || cols === 1
        ? next.slice()
        : Array.from({ length: rows }, (_, r) =>
            next.slice(r * cols, r * cols + cols),
          );
    onChange(shape);
  }

  function moveFocus(from: number, dir: "left" | "right" | "up" | "down") {
    let to = from;
    if (dir === "right") to = from + 1;
    else if (dir === "left") to = from - 1;
    else if (dir === "down") to = from + cols;
    else if (dir === "up") to = from - cols;
    if (to >= 0 && to < total) refs.current[to]?.focus();
  }

  // Render brackets-shaped layout: column of rows, with chunky [ and ] on the sides.
  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: 12,
        padding: "10px 14px",
        background: "var(--paper)",
        border: "4px solid var(--ink)",
        borderRadius: 22,
        boxShadow: "0 5px 0 0 var(--ink)",
        width: "fit-content",
        maxWidth: "100%",
      }}
    >
      <Bracket side="left" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 64px)`,
          gridAutoRows: "52px",
          gap: 8,
        }}
      >
        {cells.map((v, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            value={v}
            onChange={(e) => set(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" && (e.currentTarget.selectionStart ?? 0) === v.length) {
                e.preventDefault();
                moveFocus(i, "right");
              } else if (e.key === "ArrowLeft" && e.currentTarget.selectionStart === 0) {
                e.preventDefault();
                moveFocus(i, "left");
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                moveFocus(i, "down");
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                moveFocus(i, "up");
              }
            }}
            style={{
              width: "100%",
              height: "100%",
              textAlign: "center",
              background: "var(--cream-deep)",
              border: "3px solid var(--ink)",
              borderRadius: 12,
              boxShadow: "0 3px 0 0 var(--ink)",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 18,
              color: "var(--ink)",
              padding: "0 6px",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--grape)";
              e.currentTarget.style.boxShadow = "0 3px 0 0 var(--grape-deep)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--ink)";
              e.currentTarget.style.boxShadow = "0 3px 0 0 var(--ink)";
            }}
          />
        ))}
      </div>
      <Bracket side="right" />
    </div>
  );
}

function Bracket({ side }: { side: "left" | "right" }) {
  const ink = "var(--ink)";
  const w = 14;
  const edge = side === "left" ? "left" : "right";
  return (
    <div style={{ position: "relative", width: w, alignSelf: "stretch" }}>
      <span style={{ position: "absolute", [edge]: 0, top: 0, bottom: 0, width: 4, background: ink, borderRadius: 2 }} />
      <span style={{ position: "absolute", [edge]: 0, top: 0, width: w, height: 4, background: ink, borderRadius: 2 }} />
      <span style={{ position: "absolute", [edge]: 0, bottom: 0, width: w, height: 4, background: ink, borderRadius: 2 }} />
    </div>
  );
}
