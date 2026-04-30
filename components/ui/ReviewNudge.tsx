"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { TOPIC_META, type Topic } from "@/lib/topics";
import { ChunkyButton } from "./ChunkyButton";

type Props = {
  topic: Topic | null;
  onDismiss: () => void;
};

export function ReviewNudge({ topic, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {topic && (
        <motion.div
          initial={{ y: -20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          data-light-card
          style={{
            background: "var(--lemon)",
            border: "4px solid var(--ink)",
            borderRadius: 22,
            boxShadow: "0 6px 0 0 var(--ink)",
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div style={{ minWidth: 220 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 11,
                color: "var(--ink)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 2,
              }}
            >
              ✦ Three misses on this topic
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 14,
                color: "var(--ink)",
                lineHeight: 1.4,
              }}
            >
              Take a beat? Review {TOPIC_META[topic].label} for a quick refresher.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href={`/review/${topic}`}>
              <ChunkyButton size="sm" color="var(--paper)">
                Open review
              </ChunkyButton>
            </Link>
            <ChunkyButton size="sm" color="var(--paper)" onClick={onDismiss}>
              Dismiss
            </ChunkyButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
