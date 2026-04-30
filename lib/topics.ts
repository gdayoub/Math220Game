export type Topic =
  | "rref"
  | "independence"
  | "basis"
  | "eigen"
  | "orthogonality"
  | "leastSquares"
  | "matrixOps";

export type Difficulty = "easy" | "medium" | "hard";
export type Confidence = "sure" | "maybe" | "guess";

export type InputType =
  | "scalar"
  | "vector"
  | "matrix"
  | "multiple-choice"
  | "boolean";

export type Question = {
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  prompt: string;
  inputType: InputType;
  answer: unknown;
  choices?: string[];
  steps: string[];
  commonMistake: string;
  conceptTag: string;
  timeLimitSec: number;
};

export const ALL_TOPICS: Topic[] = [
  "rref",
  "independence",
  "basis",
  "eigen",
  "orthogonality",
  "leastSquares",
  "matrixOps",
];

export const TOPIC_META: Record<
  Topic,
  { label: string; short: string; tagline: string }
> = {
  rref: {
    label: "Systems & RREF",
    short: "RREF",
    tagline: "Solve, reduce, and read off rank.",
  },
  independence: {
    label: "Independence & Span",
    short: "INDEP",
    tagline: "Are these vectors really distinct?",
  },
  basis: {
    label: "Basis & Dimension",
    short: "BASIS",
    tagline: "Build a coordinate system from scratch.",
  },
  eigen: {
    label: "Eigenvalues & Eigenvectors",
    short: "EIGEN",
    tagline: "Find the invariant directions.",
  },
  orthogonality: {
    label: "Orthogonality & Projections",
    short: "ORTHO",
    tagline: "Project, decompose, and verify.",
  },
  leastSquares: {
    label: "Least Squares",
    short: "LSQ",
    tagline: "Best fit when no solution exists.",
  },
  matrixOps: {
    label: "Matrix Operations & Inverses",
    short: "OPS",
    tagline: "Multiply, invert, and detect singularity.",
  },
};
