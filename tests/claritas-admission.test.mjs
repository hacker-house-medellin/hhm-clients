import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const runner = fileURLToPath(new URL("../scripts/test-claritas-admin.mjs", import.meta.url));
function refused(source, pattern) {
  const env = { ...process.env }; delete env.CLARITAS_SOURCE_ROOT;
  if (source) env.CLARITAS_SOURCE_ROOT = source;
  const result = spawnSync(process.execPath, [runner], { env, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, pattern);
}
test("missing approved source is failure, never a skip or fallback", () => {
  refused(undefined, /CLARITAS_SOURCE_ROOT is required/);
});
test("modified source bytes fail admission before compilation", () => {
  const root = mkdtempSync(join(tmpdir(), "claritas-admission-"));
  try {
    mkdirSync(join(root, "src/ts/src"), { recursive: true });
    writeFileSync(join(root, "src/ts/src/index.ts"), "export const forged = true;\n");
    refused(root, /Claritas source integrity mismatch/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
test("symlinked source is not admitted", () => {
  const root = mkdtempSync(join(tmpdir(), "claritas-admission-"));
  try {
    mkdirSync(join(root, "src/ts/src"), { recursive: true });
    writeFileSync(join(root, "outside.ts"), "export const forged = true;\n");
    symlinkSync(join(root, "outside.ts"), join(root, "src/ts/src/index.ts"));
    refused(root, /symlink source rejected/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
