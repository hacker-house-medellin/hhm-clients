import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const root = new URL("../", import.meta.url);
const json = path => JSON.parse(readFileSync(new URL(path, root), "utf8"));
test("admin integration does not modify the public SDK export boundary", () => {
  const client = json("clients/typescript/package.json");
  assert.equal(client.exports?.["./admin-viz"], undefined);
  assert.equal(existsSync(new URL("clients/typescript/src/claritas-admin.ts", root)), false);
});
test("private integration has a real built entry point and explicit Claritas peer", () => {
  const pkg = json("integrations/claritas/package.json");
  assert.equal(pkg.private, true);
  assert.equal(pkg.type, "module");
  assert.equal(pkg.exports["."].default, "./dist/index.js");
  assert.equal(pkg.peerDependencies["@claritas-viz/claritas-pub-lib-core"], "0.1.0");
  assert.equal(json("integrations/claritas/tsconfig.json").compilerOptions.strict, true);
});
test("compiled integration fixture cannot be picked up before its build", () => {
  assert.equal(existsSync(new URL("tests/claritas-admin.test.mjs", root)), false);
  assert.equal(existsSync(new URL("conformance/claritas-admin.cases.mjs", root)), true);
  assert.match(readFileSync(new URL("scripts/test-claritas-admin.mjs", root), "utf8"), /conformance\/claritas-admin\.cases\.mjs/);
});
