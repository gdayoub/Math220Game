"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useClient } from "@/lib/clientStore";

export function BootGate({ children }: { children: React.ReactNode }) {
  const { bootedThisSession, markBooted } = useClient();
  useEffect(() => {
    if (!bootedThisSession) {
      const t = setTimeout(markBooted, 1500);
      return () => clearTimeout(t);
    }
  }, [bootedThisSession, markBooted]);

  if (!bootedThisSession) return <BootSplash />;
  return <>{children}</>;
}

export function BootSplash() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 22,
      }}
    >
      <motion.div
        data-wordmark
        initial={{ scale: 0.5, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 12 }}
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 96,
          lineHeight: 0.95,
          color: "var(--accent-1)",
          WebkitTextStroke: "5px var(--ink)",
          textShadow: "0 9px 0 var(--ink)",
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
        }}
      >
        MATH 220
      </motion.div>
      <motion.div
        data-arena
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 28,
          color: "var(--accent-2)",
          letterSpacing: "0.1em",
        }}
      >
        ARENA
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 13,
          color: "var(--ink-soft)",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
        }}
      >
        Loading your operator…
      </motion.div>
    </div>
  );
}
