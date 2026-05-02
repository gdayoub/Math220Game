# Math 220 Arena

Adaptive Linear Algebra training system for the Math 220 final. Red/black, keyboard-first, game-like.

## Run

```bash
npm run dev
```

Open the URL the dev server prints (defaults to http://localhost:3000, falls back if occupied).

## Deploy to Vercel (free tier)

Each visitor gets an anonymous, isolated profile via an httpOnly cookie — no
login screen. Local development still uses `data/` JSON files; production
flips automatically to Upstash Redis based on env vars.

1. **Push the repo** to GitHub (already on `gdayoub/Math220Game`).
2. **Import on Vercel**: vercel.com/new → pick the GitHub repo → defaults are fine.
3. **Add Upstash Redis** (free): Vercel project → Storage → Create Database
   → "Upstash for Redis" marketplace integration → Connect to project. Vercel
   injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
4. **Redeploy** (Vercel will auto-redeploy after the integration links).
   Visit the URL — boot splash → home. Each browser/device = its own profile.

Cost: $0/mo on Vercel Hobby + Upstash free tier (256 MB storage, 500 k
commands/month). Rate-limited to 30 req / 10 sec per user on the write
endpoints to stay safely under the 1 M function-invocation cap.

## Modes

- **Survival** — 3 lives, difficulty climbs over time, time pressure
- **Weakness Training** — adaptive engine prioritizes the topics where accuracy is lowest
- **Speed Run** — 10 questions, scored on speed + accuracy
- **Boss Battle** — pick one topic, 10 escalating problems
- **Visualization** — drag matrix sliders, see live eigenvectors, det as transformed-square area, predict-then-reveal

## Topics covered

RREF / systems · linear independence + span · basis + dimension · eigenvalues + eigenvectors · orthogonality + projections · least squares · matrix operations + determinants

## Architecture (greenfield, single-user)

```
app/
  page.tsx                  Home (mode tiles + stats summary)
  play/[mode]/page.tsx      Game loop (5 modes share this screen)
  viz/page.tsx              Visualization sandbox
  boss/page.tsx             Topic picker for Boss Battle
  stats/page.tsx            Performance dashboard + mistake log + cheat-sheet export
  api/
    question/   POST → adaptive next question
    evaluate/   POST → grade + persist + XP
    profile/    GET  → current profile
    history/    GET  → mistake log
lib/
  topics.ts                 Topic metadata + Question type
  generators/               One file per topic (procedural problem factories)
  matrixMath.ts             RREF, eig, det, inv (mathjs wrappers)
  grade.ts                  Order/parallel-aware answer comparison
  scoring.ts                XP with confidence + speed + streak multipliers
  srs.ts                    SM-2-lite spaced repetition
  adaptive.ts               Topic + difficulty selection
  profile.ts                Local JSON persistence (data/profile.json)
components/
  QuestionCard, AnswerInput, Timer, HUD, ConfidencePicker, Tex
  viz/TransformCanvas       SVG grid + eigenvector overlay + det area
data/                       profile.json + question-history.jsonl (created on first run)
```

## Adaptive engine highlights

- **SRS queue** — wrong answers resurface 3 → 7 → 21 questions later
- **Interleaving guard** — never two consecutive questions from same topic (except Boss)
- **Confidence calibration** — high-confidence wrongs cost extra XP, low-confidence ones cost less
- **EMA mastery** — per-topic difficulty selection adapts every answer

## Smoke test

```bash
npx tsx scripts/smoke-generators.ts
```

Generates 30 problems × 7 topics × 3 difficulties (= 630), verifies each canonical answer self-grades.

## Keyboard

- `Enter` — submit / next


## Future hooks (not yet wired)

- `lib/gemini.ts` placeholder for explanations on wrong answers (drop in `GEMINI_API_KEY` from LionPlanner)
- `lib/pdfSeed.ts` for parsing `~/Downloads/Math220FinalReviewSp26.pdf` into the canonical question pool
