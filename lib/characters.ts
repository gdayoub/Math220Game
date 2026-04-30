import type { Topic } from "./topics";

export type CharacterId =
  | "pivot"
  | "spectral"
  | "orthos"
  | "determinant"
  | "nullity"
  | "basis";

export type Character = {
  id: CharacterId;
  name: string;
  glyph: string;
  title: string;
  tagline: string;
  passive: string;
  topicXpMultiplier?: Partial<Record<Topic, number>>;
  globalXpMultiplier?: number;
  timeMultiplier?: number;
  bonusLives?: number;
  srsIntervalMultiplier?: number;
  /** Bean body color — references a CSS variable from the design palette. */
  color: string;
  /** Eye color override — dark beans need cream eyes for contrast. */
  eyeColor?: string;
};

export const CHARACTERS: Character[] = [
  {
    id: "pivot",
    name: "THE PIVOT",
    glyph: "⊞",
    title: "RREF Specialist",
    tagline: "Reduces fast. Pivots faster.",
    passive: "+20% XP on Systems / RREF",
    topicXpMultiplier: { rref: 1.2 },
    color: "var(--mint)",
  },
  {
    id: "spectral",
    name: "SPECTRAL",
    glyph: "λ",
    title: "Eigenvalue Hunter",
    tagline: "Sees through the matrix to its core.",
    passive: "+50% XP on Eigenvalue problems",
    topicXpMultiplier: { eigen: 1.5 },
    color: "var(--grape)",
    eyeColor: "#FFF4E6",
  },
  {
    id: "orthos",
    name: "ORTHOS",
    glyph: "⊥",
    title: "Projection Master",
    tagline: "Drops the orthogonal. Keeps the parallel.",
    passive: "+30% XP on Orthogonality & Least Squares",
    topicXpMultiplier: { orthogonality: 1.3, leastSquares: 1.3 },
    color: "var(--sky)",
  },
  {
    id: "determinant",
    name: "THE DETERMINANT",
    glyph: "|A|",
    title: "Balanced Operator",
    tagline: "Steady. Reliable. One extra life.",
    passive: "+1 life in Survival mode",
    bonusLives: 1,
    color: "var(--ink)",
    eyeColor: "#FFF4E6",
  },
  {
    id: "nullity",
    name: "NULLITY",
    glyph: "∅",
    title: "Glass Cannon",
    tagline: "Less time. Double XP. High risk, high yield.",
    passive: "−20% time per question · +100% XP",
    timeMultiplier: 0.8,
    globalXpMultiplier: 2.0,
    color: "var(--pink)",
  },
  {
    id: "basis",
    name: "BASIS",
    glyph: "{b}",
    title: "Adaptive Learner",
    tagline: "SRS reviews surface twice as often.",
    passive: "Spaced-repetition queue runs 2× faster",
    srsIntervalMultiplier: 0.5,
    color: "var(--peach)",
  },
];

export function getCharacter(
  id: CharacterId | null | undefined,
): Character | null {
  if (!id) return null;
  return CHARACTERS.find((c) => c.id === id) ?? null;
}
