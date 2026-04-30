"use client";
import { useEffect, useState } from "react";
import { useClient } from "@/lib/clientStore";

const LINES = [
  "> initializing arena.exe",
  "> mounting tensor cores ......... [OK]",
  "> linking eigen-decomposition ... [OK]",
  "> calibrating projection space .. [OK]",
  "> spectral analyzer ............. ONLINE",
  "> WELCOME, OPERATOR.",
];

export function BootSequence({ onDone }: { onDone: () => void }) {
  const [shownLines, setShownLines] = useState<string[]>([]);
  const [typing, setTyping] = useState("");
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (lineIdx >= LINES.length) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const target = LINES[lineIdx];
    if (charIdx < target.length) {
      const id = setTimeout(() => {
        setTyping(target.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      }, lineIdx === LINES.length - 1 ? 30 : 12);
      return () => clearTimeout(id);
    }
    const pause = setTimeout(() => {
      setShownLines((prev) => [...prev, target]);
      setTyping("");
      setCharIdx(0);
      setLineIdx((i) => i + 1);
    }, lineIdx === LINES.length - 1 ? 600 : 80);
    return () => clearTimeout(pause);
  }, [lineIdx, charIdx, onDone]);

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--color-bg)] crt-vignette flex items-center justify-center">
      <div className="font-mono text-sm md:text-base text-[var(--color-accent)] text-glow space-y-1 max-w-md w-full px-8">
        {shownLines.map((l, i) => (
          <div key={i} className="opacity-70">{l}</div>
        ))}
        {lineIdx < LINES.length && (
          <div className="cursor-blink">{typing}</div>
        )}
      </div>
    </div>
  );
}

export function BootGate({ children }: { children: React.ReactNode }) {
  const { bootedThisSession, markBooted } = useClient();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hydrated) return <>{children}</>;
  if (!bootedThisSession) {
    return <BootSequence onDone={markBooted} />;
  }
  return <>{children}</>;
}
