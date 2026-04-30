"use client";
import { motion } from "framer-motion";
import { useClient, type Theme } from "@/lib/clientStore";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ThemePicker } from "@/components/ui/ThemePicker";
import { useEffect } from "react";

const THEME_OPTS: Array<{
  id: Theme;
  label: string;
  tagline: string;
  swatches: string[];
  bg: string;
  textColor: string;
}> = [
  {
    id: "candy",
    label: "Candy",
    tagline: "Cream + pastels. Bouncy & cheerful.",
    swatches: ["#FF6BAD", "#5EE2B8", "#FFD93D", "#9B6BFF", "#5EC2FF", "#FFA864"],
    bg: "var(--paper)",
    textColor: "var(--ink)",
  },
  {
    id: "red",
    label: "Red / Black",
    tagline: "Strict palette. Crisp menace.",
    swatches: ["#FF1F3D", "#0E0606", "#FF1F3D", "#FFFFFF"],
    bg: "#2A1010",
    textColor: "#FFFFFF",
  },
];

export default function SettingsPage() {
  const { theme, setTheme } = useClient();

  // Apply theme attribute (in case ThemePicker isn't mounted yet)
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (theme === "candy") document.body.removeAttribute("data-theme");
    else document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <>
      <ScreenShell
        title="Settings"
        subtitle="Tune the look. Pick a palette."
        glyph="⚙"
        accent="var(--lemon)"
      >
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
            Theme
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {THEME_OPTS.map((opt, i) => {
              const active = theme === opt.id;
              const isDark = opt.id === "red";
              return (
                <motion.button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  whileHover={{ y: -4, rotate: i % 2 === 0 ? -2 : 2 }}
                  whileTap={{ y: 2, scale: 0.97 }}
                  style={{
                    background: opt.bg,
                    border: active
                      ? "5px solid var(--lemon)"
                      : "4px solid var(--ink)",
                    borderRadius: 28,
                    boxShadow: active
                      ? "0 8px 0 0 var(--ink)"
                      : "0 6px 0 0 var(--ink)",
                    padding: "20px 24px",
                    cursor: "pointer",
                    textAlign: "left",
                    color: opt.textColor,
                    font: "inherit",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 14,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: 22,
                        color: opt.textColor,
                      }}
                    >
                      {opt.label}
                    </span>
                    {active && (
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: 11,
                          color: "var(--ink)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          background: "var(--lemon)",
                          border: "3px solid var(--ink)",
                          borderRadius: 999,
                          padding: "4px 12px",
                          boxShadow: "0 3px 0 0 var(--ink)",
                        }}
                      >
                        Active ✓
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                      fontSize: 14,
                      color: opt.textColor,
                      opacity: isDark ? 0.85 : 0.75,
                      marginBottom: 14,
                    }}
                  >
                    {opt.tagline}
                  </p>
                  <div style={{ display: "flex", gap: 6 }}>
                    {opt.swatches.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          width: 36,
                          height: 36,
                          background: s,
                          border: "3px solid " + (isDark ? "#FFFFFF" : "var(--ink)"),
                          borderRadius: 12,
                          boxShadow:
                            "0 3px 0 0 " + (isDark ? "#000000" : "var(--ink)"),
                        }}
                      />
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        <section
          data-light-card
          style={{
            background: "var(--paper)",
            border: "4px solid var(--ink)",
            borderRadius: 22,
            boxShadow: "0 6px 0 0 var(--ink)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <h2
            data-on-paper
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 18,
              color: "var(--ink)",
            }}
          >
            About
          </h2>
          <p
            data-on-paper-soft
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 14,
              color: "var(--ink-soft)",
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: "var(--ink)" }}>MATH 220 ARENA</strong> — an
            adaptive linear-algebra training game. Six bean operators, seven
            topics, five game modes. Built with Next.js · React · Tailwind ·
            framer-motion · KaTeX.
          </p>
          <p
            data-on-paper-soft
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 13,
              color: "var(--ink-faint)",
              lineHeight: 1.5,
              marginTop: 6,
            }}
          >
            Tip: keystrokes — [1/2/3] confidence, [Enter] submit/next, [Esc]
            exit a run.
          </p>
        </section>
      </ScreenShell>
      <ThemePicker />
    </>
  );
}
