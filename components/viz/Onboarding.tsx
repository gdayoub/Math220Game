"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Tex } from "@/components/Tex";

const KEY = "viz.onboarded.v1";

export function Onboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(KEY)) setShow(true);
  }, []);

  const dismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, "1");
    }
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-label="Visualization tips"
          style={{
            background: "var(--paper)",
            border: "4px solid var(--ink)",
            borderRadius: 18,
            boxShadow: "0 6px 0 0 var(--ink)",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 18,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 22,
              background: "var(--lemon)",
              border: "3px solid var(--ink)",
              borderRadius: 12,
              boxShadow: "0 3px 0 0 var(--ink)",
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ✦
          </span>
          <div
            data-on-paper
            style={{
              flex: 1,
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 14,
              color: "var(--ink)",
              lineHeight: 1.4,
            }}
          >
            <Tex>
              {
                "Drag the colored dots on the canvas to set $A\\vec{e}_1$ and $A\\vec{e}_2$. Press $\\textsf{Space}$ to play, $\\textsf{1}$–$\\textsf{9}$ for presets, $\\textsf{R}$ to reset, $\\textsf{[}$ / $\\textsf{]}$ to switch modes."
              }
            </Tex>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss tips"
            style={{
              background: "var(--mint)",
              border: "3px solid var(--ink)",
              borderRadius: 999,
              boxShadow: "0 3px 0 0 var(--ink)",
              padding: "8px 14px",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 12,
              color: "var(--ink)",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Got it
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
