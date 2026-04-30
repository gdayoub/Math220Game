"use client";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { ThemePicker } from "@/components/ui/ThemePicker";
import { Onboarding } from "@/components/viz/Onboarding";
import { TransformMode } from "@/components/viz/modes/TransformMode";
import { EigenMode } from "@/components/viz/modes/EigenMode";
import { RrefMode } from "@/components/viz/modes/RrefMode";
import { SpanMode } from "@/components/viz/modes/SpanMode";
import { LeastSquaresMode } from "@/components/viz/modes/LeastSquaresMode";
import { PRESETS } from "@/components/viz/PresetCarousel";
import {
  DEFAULT_STATE,
  type VizMode,
  type VizState,
  decodeUrl,
  encodeUrl,
} from "@/lib/viz/urlState";
import { IDENTITY, type Mat2, type Vec2 } from "@/lib/viz/linalg2";

const MODES: { id: VizMode; label: string; glyph: string; color: string }[] = [
  { id: "transform", label: "Transform", glyph: "⇄", color: "var(--sky)" },
  { id: "eigen", label: "Eigenvectors", glyph: "λ", color: "var(--grape)" },
  { id: "rref", label: "RREF stepper", glyph: "≡", color: "var(--lemon)" },
  { id: "span", label: "Span", glyph: "⊕", color: "var(--mint)" },
  { id: "lsq", label: "Least squares", glyph: "≈", color: "var(--peach)" },
];

const DEFAULT_AUG: number[][] = [
  [1, 2, 3, 4],
  [2, 4, 6, 8],
  [1, 1, 1, 1],
];
const DEFAULT_SPAN: { u: Vec2; v: Vec2 } = { u: [2, 1], v: [1, 3] };
const DEFAULT_PTS: Vec2[] = [
  [-3, -2],
  [-1, -0.5],
  [0, 0.5],
  [1, 1.2],
  [3, 3.1],
];

export default function VizPage() {
  return (
    <Suspense fallback={null}>
      <VizPageInner />
      <ThemePicker />
    </Suspense>
  );
}

function VizPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, setState] = useState<VizState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [playSignal, setPlaySignal] = useState(0);
  const [copied, setCopied] = useState(false);

  // Hydrate from URL on mount.
  useEffect(() => {
    setState(decodeUrl(new URLSearchParams(searchParams.toString())));
    setHydrated(true);
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mq.matches);
      const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state → URL.
  useEffect(() => {
    if (!hydrated) return;
    const qs = encodeUrl(state);
    router.replace(`/viz${qs}`, { scroll: false });
  }, [state, hydrated, router]);

  const setMode = useCallback((mode: VizMode) => {
    setState((s) => ({ ...s, mode }));
  }, []);

  const setMatrix = useCallback((matrix: Mat2) => {
    setState((s) => ({ ...s, matrix }));
  }, []);

  const setAugmented = useCallback((augmented: number[][]) => {
    setState((s) => ({ ...s, augmented }));
  }, []);

  const setSpan = useCallback((u: Vec2, v: Vec2) => {
    setState((s) => ({ ...s, span: { u, v } }));
  }, []);

  const setPoints = useCallback((points: Vec2[]) => {
    setState((s) => ({ ...s, points }));
  }, []);

  // Keyboard shortcuts.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;

      // Mode cycling
      if (e.key === "[" || e.key === "]") {
        const idx = MODES.findIndex((m) => m.id === state.mode);
        const next = e.key === "]"
          ? (idx + 1) % MODES.length
          : (idx - 1 + MODES.length) % MODES.length;
        setMode(MODES[next].id);
        e.preventDefault();
        return;
      }

      if (state.mode === "transform" || state.mode === "eigen") {
        if (e.key >= "1" && e.key <= "9") {
          const k = parseInt(e.key, 10) - 1;
          if (k < PRESETS.length) {
            setMatrix(PRESETS[k].matrix);
            e.preventDefault();
            return;
          }
        }
        if (e.key === "r" || e.key === "R") {
          setMatrix(IDENTITY);
          e.preventDefault();
          return;
        }
        if (e.key === " ") {
          setPlaySignal((p) => p + 1);
          e.preventDefault();
          return;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.mode, setMode, setMatrix]);

  const copyShare = async () => {
    if (typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const augmented = state.augmented ?? DEFAULT_AUG;
  const spanVecs = state.span ?? DEFAULT_SPAN;
  const points = state.points ?? DEFAULT_PTS;

  const subtitle = useMemo(() => {
    switch (state.mode) {
      case "transform":
        return "See the transformation breathe. Drag the dots, press space to play.";
      case "eigen":
        return "Spin v around — when it lines up, Av = λv pops.";
      case "rref":
        return "Watch elementary row ops reduce a matrix step by step.";
      case "span":
        return "Drag two vectors. Independent → plane. Parallel → line.";
      case "lsq":
        return "Click to add points. The line that fits best lights up.";
    }
  }, [state.mode]);

  return (
    <ScreenShell
      title="Visualization"
      subtitle={subtitle}
      glyph="✶"
      accent="var(--sky)"
    >
      <Onboarding />

      <div
        role="tablist"
        aria-label="Visualization modes"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 18,
          alignItems: "center",
        }}
      >
        {MODES.map((m, i) => {
          const active = state.mode === m.id;
          return (
            <motion.button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={active}
              whileHover={{ y: -2, rotate: i % 2 === 0 ? -1 : 1 }}
              whileTap={{ y: 2, scale: 0.97 }}
              onClick={() => setMode(m.id)}
              style={{
                background: active ? m.color : "var(--paper)",
                border: active ? "4px solid var(--ink)" : "3px solid var(--ink)",
                borderRadius: 999,
                boxShadow: "0 4px 0 0 var(--ink)",
                padding: "10px 18px",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 13,
                color: "var(--ink)",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 16 }}>{m.glyph}</span>
              {m.label}
            </motion.button>
          );
        })}
        <span style={{ flex: 1 }} />
        <ChunkyButton size="sm" color="var(--lemon)" onClick={copyShare}>
          {copied ? "Copied!" : "Share link"}
        </ChunkyButton>
      </div>

      {state.mode === "transform" && (
        <TransformMode
          matrix={state.matrix}
          onMatrixChange={setMatrix}
          reducedMotion={reducedMotion}
          playSignal={playSignal}
        />
      )}
      {state.mode === "eigen" && (
        <EigenMode
          matrix={state.matrix}
          onMatrixChange={setMatrix}
          reducedMotion={reducedMotion}
        />
      )}
      {state.mode === "rref" && (
        <RrefMode
          augmented={augmented}
          onChange={setAugmented}
          reducedMotion={reducedMotion}
        />
      )}
      {state.mode === "span" && (
        <SpanMode
          u={spanVecs.u}
          v={spanVecs.v}
          onChange={(u, v) => setSpan(u, v)}
          reducedMotion={reducedMotion}
        />
      )}
      {state.mode === "lsq" && (
        <LeastSquaresMode
          points={points}
          onChange={setPoints}
          reducedMotion={reducedMotion}
        />
      )}

      <p
        style={{
          marginTop: 20,
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 11,
          color: "var(--ink-faint)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          textAlign: "center",
        }}
      >
        Shortcuts: 1–9 presets · R reset · Space play · [ ] switch modes
      </p>
    </ScreenShell>
  );
}
