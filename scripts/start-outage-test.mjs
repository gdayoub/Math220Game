// Local-only production-build fixture. These are dummy credentials, never real secrets.
import { spawn } from "node:child_process";
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", process.argv[2] ?? "3220"], {
  stdio: "inherit",
  env: { ...process.env, KV_REST_API_URL: "http://127.0.0.1:9", KV_REST_API_TOKEN: "local-test-placeholder" },
});
child.on("exit", (code) => process.exit(code ?? 1));
