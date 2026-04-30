import type { Question, Topic, Difficulty } from "../topics";
import { generateRref } from "./rref";
import { generateIndependence } from "./independence";
import { generateBasis } from "./basis";
import { generateEigen } from "./eigen";
import { generateOrthogonality } from "./orthogonality";
import { generateLeastSquares } from "./leastSquares";
import { generateMatrixOps } from "./matrixOps";

type Generator = (d: Difficulty) => Question;

const REGISTRY: Record<Topic, Generator> = {
  rref: generateRref,
  independence: generateIndependence,
  basis: generateBasis,
  eigen: generateEigen,
  orthogonality: generateOrthogonality,
  leastSquares: generateLeastSquares,
  matrixOps: generateMatrixOps,
};

export function generateQuestion(topic: Topic, difficulty: Difficulty): Question {
  const gen = REGISTRY[topic];
  return gen(difficulty);
}

export function registerGenerator(topic: Topic, gen: Generator): void {
  REGISTRY[topic] = gen;
}
