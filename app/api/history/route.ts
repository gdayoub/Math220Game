import fs from "node:fs/promises";
import path from "node:path";

const HISTORY_PATH = path.join(process.cwd(), "data", "question-history.jsonl");

export async function GET() {
  try {
    const raw = await fs.readFile(HISTORY_PATH, "utf8");
    const lines = raw.trim().split("\n").filter(Boolean);
    const entries = lines.map((l) => JSON.parse(l));
    return Response.json({ entries });
  } catch {
    return Response.json({ entries: [] });
  }
}
