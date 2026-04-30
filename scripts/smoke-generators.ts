import { generateQuestion } from "../lib/generators";
import { ALL_TOPICS, type Difficulty, type Topic } from "../lib/topics";
import { gradeAnswer } from "../lib/grade";

const DIFFS: Difficulty[] = ["easy", "medium", "hard"];
const N = 30;

function describeAnswer(a: unknown): string {
  if (Array.isArray(a)) return `[${a.join(", ")}]`;
  return String(a);
}

let total = 0;
let failed = 0;
const samples: string[] = [];

for (const topic of ALL_TOPICS as Topic[]) {
  for (const diff of DIFFS) {
    for (let i = 0; i < N; i++) {
      total++;
      let q;
      try {
        q = generateQuestion(topic, diff);
      } catch (e) {
        failed++;
        console.error(`✗ ${topic}/${diff} #${i}: generation threw`, e);
        continue;
      }
      // The canonical answer must grade as correct
      const ok = gradeAnswer(q, q.answer);
      if (!ok) {
        failed++;
        if (samples.length < 5) {
          samples.push(
            `${topic}/${diff}#${i}: answer=${describeAnswer(q.answer)} | prompt: ${q.prompt.slice(0, 100)}`,
          );
        }
        console.error(`✗ ${topic}/${diff} #${i}: canonical answer failed self-grade`);
      }
    }
  }
}

console.log(`\n${total - failed}/${total} questions self-graded correctly`);
if (failed) {
  console.log("\nFailing samples:");
  for (const s of samples) console.log(" ", s);
  process.exit(1);
}
