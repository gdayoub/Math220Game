"use client";
import { useEffect } from "react";
import { useClient, type Theme } from "@/lib/clientStore";

const OPTS: Array<{ id: Theme; label: string; swatch: string[] }> = [
  { id: "candy", label: "Candy", swatch: ["#FF6BAD", "#5EE2B8", "#FFD93D", "#9B6BFF"] },
  { id: "red", label: "Red/Blk", swatch: ["#FF1F3D", "#0E0606", "#FF1F3D", "#0E0606"] },
];

export function ThemePicker() {
  const { theme, setTheme } = useClient();

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (theme === "candy") document.body.removeAttribute("data-theme");
    else document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const isCandy = theme === "candy";
  return (
    <div
      style={{
        position: "fixed",
        bottom: 18,
        right: 18,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        background: isCandy ? "#FFFFFF" : "#2A1010",
        border: "4px solid " + (isCandy ? "#2B1B3D" : "#FF1F3D"),
        borderRadius: 20,
        padding: 10,
        boxShadow: "0 6px 0 0 " + (isCandy ? "#2B1B3D" : "#0a0a0a"),
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: isCandy ? "#2B1B3D" : "#FFFFFF",
          padding: "0 4px",
        }}
      >
        Theme
      </div>
      {OPTS.map((o) => {
        const active = theme === o.id;
        return (
          <button
            key={o.id}
            onClick={() => setTheme(o.id)}
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: active
                ? "#FFD93D"
                : isCandy
                  ? "#FFF4E6"
                  : "#1A0A0A",
              border: "3px solid " + (isCandy ? "#2B1B3D" : "#FF1F3D"),
              borderRadius: 14,
              padding: "6px 10px",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 12,
              color: active ? "#2B1B3D" : isCandy ? "#2B1B3D" : "#FFFFFF",
              boxShadow: active
                ? "0 3px 0 0 " + (isCandy ? "#2B1B3D" : "#0a0a0a")
                : "none",
            }}
          >
            <span style={{ display: "flex" }}>
              {o.swatch.map((c, i) => (
                <span
                  key={i}
                  style={{
                    width: 10,
                    height: 16,
                    background: c,
                    borderTop: "2px solid #0a0a0a",
                    borderBottom: "2px solid #0a0a0a",
                    borderLeft: i === 0 ? "2px solid #0a0a0a" : "none",
                    borderRight:
                      i === o.swatch.length - 1 ? "2px solid #0a0a0a" : "none",
                  }}
                />
              ))}
            </span>
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
