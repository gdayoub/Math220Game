"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOPIC_CONTENT } from "@/lib/topicContent";
import type { Topic } from "@/lib/topics";
import { TOPIC_META } from "@/lib/topics";
import { Tex } from "@/components/Tex";

type Props = {
  topic: Topic;
  children: React.ReactNode;
};

/** Click/tap the wrapped element to toggle a chunky popover with the topic blurb. */
export function ConceptTooltip({ topic, children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const meta = TOPIC_META[topic];
  const content = TOPIC_CONTENT[topic];

  return (
    <span
      ref={ref}
      style={{ position: "relative", display: "inline-block" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: 0,
          background: "transparent",
          border: 0,
          cursor: "pointer",
          font: "inherit",
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`About ${meta.label}`}
      >
        {children}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            data-light-card
            style={{
              position: "absolute",
              top: "calc(100% + 12px)",
              left: 0,
              zIndex: 30,
              minWidth: 280,
              maxWidth: 380,
              background: "var(--paper)",
              border: "4px solid var(--ink)",
              borderRadius: 22,
              boxShadow: "0 7px 0 0 var(--ink)",
              padding: "16px 18px",
              textAlign: "left",
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
                marginBottom: 4,
              }}
            >
              {meta.label}
            </div>
            <p
              data-on-paper
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 14,
                color: "var(--ink)",
                lineHeight: 1.5,
                marginBottom: 10,
              }}
            >
              <Tex>{content.blurb}</Tex>
            </p>
            <a
              href={`/review/${topic}`}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 12,
                color: "var(--accent-1)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                textDecoration: "none",
              }}
            >
              Open full review →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
