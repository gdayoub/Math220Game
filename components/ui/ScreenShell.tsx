"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { ChunkyButton } from "./ChunkyButton";

type Props = {
  title: string;
  subtitle?: string;
  glyph: string;
  accent?: string;
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function ScreenShell({
  title,
  subtitle,
  glyph,
  accent = "var(--lemon)",
  children,
  backHref = "/",
  backLabel = "← Home",
}: Props) {
  return (
    <div
      style={{
        padding: "24px 36px 60px",
        maxWidth: 1180,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 22,
          gap: 14,
        }}
      >
        <Link href={backHref}>
          <ChunkyButton size="sm" color="var(--paper)">
            {backLabel}
          </ChunkyButton>
        </Link>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 12,
            color: "var(--ink-soft)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {title}
        </span>
        <span style={{ width: 80 }} />
      </div>
      <motion.div
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <motion.span
          data-glyph-chip
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 44,
            background: accent,
            color: "var(--ink)",
            border: "4px solid var(--ink)",
            borderRadius: 18,
            width: 78,
            height: 78,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 5px 0 0 var(--ink)",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {glyph}
        </motion.span>
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 44,
              lineHeight: 1,
              color: "var(--ink)",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                marginTop: 6,
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 16,
                color: "var(--ink-soft)",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </motion.div>
      {children}
    </div>
  );
}
