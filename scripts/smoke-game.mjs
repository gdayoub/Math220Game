import assert from "node:assert/strict";

const base = process.argv[2] ?? "http://localhost:3000";

function visitor() {
  const jar = new Map();
  return {
    jar,
    async request(path, body) {
      const response = await fetch(`${base}${path}`, {
        method: body === undefined ? "GET" : "POST",
        headers: { "content-type": "application/json", cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; ") },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      for (const cookie of response.headers.getSetCookie()) {
        const [pair] = cookie.split(";");
        const i = pair.indexOf("=");
        jar.set(pair.slice(0, i), pair.slice(i + 1));
        assert.ok(Buffer.byteLength(cookie) < 4096, "Cookie exceeds browser limit");
      }
      assert.equal(response.status, 200, `${path}: ${await response.clone().text()}`);
      return response.json();
    },
  };
}

const a = visitor();
const b = visitor();
assert.equal((await a.request("/api/profile")).totalQuestions, 0);
assert.equal((await b.request("/api/profile")).totalQuestions, 0);
for (const mode of ["survival", "weakness", "speed", "boss", "viz"]) {
  const { question } = await a.request("/api/question", { mode, bossTopic: "rref" });
  assert.ok(question.id && /\d/.test(question.prompt), `${mode}: missing numbers`);
  const result = await a.request("/api/evaluate", {
    question, userAnswer: question.answer, timeSec: 1, confidence: "sure", streak: 0,
  });
  assert.equal(result.correct, true, `${mode}: canonical answer did not grade`);
}
assert.equal((await a.request("/api/profile")).totalQuestions, 5, "Progress lost between requests");
assert.equal((await b.request("/api/profile")).totalQuestions, 0, "Progress leaked to another visitor");
assert.equal((await a.request("/api/history")).entries.length, 5);

const daily = await a.request("/api/daily");
const again = await a.request("/api/daily");
assert.equal(again.question.id, daily.question.id, "Daily question changed between requests");
const result = await a.request("/api/daily", {
  userAnswer: daily.question.answer, timeSec: 1, confidence: "sure",
});
assert.equal(result.correct, true);
assert.equal((await a.request("/api/daily")).completed, true);

// A tampered backup must not grant progress or crash the API.
const tampered = visitor();
await tampered.request("/api/profile");
tampered.jar.set("m220_profile", `${a.jar.get("m220_profile")}x`);
assert.equal((await tampered.request("/api/profile")).totalQuestions, 0);

for (const topic of ["rref", "independence", "basis", "eigen", "orthogonality", "leastSquares", "matrixOps"]) {
  const user = visitor();
  for (const idx of [0, 5, 9]) {
    const { question } = await user.request("/api/question", { mode: "boss", bossTopic: topic, questionsAnsweredInRun: idx });
    assert.equal(question.topic, topic);
    const result = await user.request("/api/evaluate", {
      question, userAnswer: question.answer, timeSec: 1, confidence: "sure", streak: 0,
    });
    assert.equal(result.correct, true, `${topic}/${question.difficulty}: grading failed`);
  }
}
console.log("PASS: all modes and topics load and grade; progress, isolation, history, daily persistence and cookie limits verified.");
