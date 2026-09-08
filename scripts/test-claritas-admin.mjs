import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, lstatSync, realpathSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { dirname, join, resolve, isAbsolute } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lock = JSON.parse(readFileSync(join(repo, "tests/claritas-source.json"), "utf8"));
const source = process.env.CLARITAS_SOURCE_ROOT;
if (!source) throw new Error("CLARITAS_SOURCE_ROOT is required; no network or test substitute is allowed");
if (lock.repository !== "claritas-viz/claritas-pub-lib-core" || !/^[a-f0-9]{40}$/.test(lock.commit) ||
    lock.compiler !== "5.8.3" || lock.files.length !== 4) throw new Error("invalid Claritas source admission");
const root = realpathSync(source);
const destinations = new Set(["src/index.ts", "src/visualization.ts", "src/cohort-visualization.ts", "package.json"]);
const verified = lock.files.map(file => {
  if (!destinations.delete(file.destination) || isAbsolute(file.path) || file.path.includes("\\") ||
      file.path.split("/").some(part => !part || part === "." || part === "..")) throw new Error("invalid source path");
  let current = root;
  for (const part of file.path.split("/")) {
    current = join(current, part);
    if (lstatSync(current).isSymbolicLink()) throw new Error("symlink source rejected");
  }
  const stat = lstatSync(current);
  if (!stat.isFile() || stat.size > 262144) throw new Error("invalid source file");
  const bytes = readFileSync(current);
  const gitBlob = createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  if (gitBlob !== file.gitBlob || sha256 !== file.sha256) throw new Error("Claritas source integrity mismatch");
  return { destination: file.destination, bytes };
});
const compiler = process.env.TSC_BIN || "tsc";
if (execFileSync(compiler, ["--version"], { encoding: "utf8" }).trim() !== "Version 5.8.3") throw new Error("TypeScript 5.8.3 required");
const workspace = mkdtempSync(join(tmpdir(), "claritas-housing-test-"));
try {
  const pkg = join(workspace, "node_modules/@claritas-viz/claritas-pub-lib-core");
  for (const file of verified) {
    const path = join(pkg, file.destination);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, file.bytes);
  }
  writeFileSync(join(workspace, "package.json"), '{"type":"module"}\n');
  const compile = (sourcePath, outputPath, files) => execFileSync(compiler, [
    "--strict", "--declaration", "--module", "NodeNext", "--target", "ES2022", "--lib", "ES2022",
    "--rootDir", sourcePath, "--outDir", outputPath, ...files,
  ], { cwd: workspace, stdio: "inherit" });
  compile(join(pkg, "src"), join(pkg, "dist"), [join(pkg, "src/index.ts"), join(pkg, "src/visualization.ts"), join(pkg, "src/cohort-visualization.ts")]);
  const moduleRoot = join(repo, "integrations/claritas");
  const moduleMetadata = readFileSync(join(moduleRoot, "package.json"));
  const modulePackage = JSON.parse(moduleMetadata);
  if (!/^@(hhaus-org|hacker-house-medellin)\/(hhaus|hhm)-admin-viz$/.test(modulePackage.name) || modulePackage.private !== true ||
      modulePackage.type !== "module" || modulePackage.exports?.["."]?.default !== "./dist/index.js") throw new Error("invalid private integration package");
  const integration = join(workspace, "node_modules", modulePackage.name);
  mkdirSync(join(integration, "src"), { recursive: true });
  mkdirSync(join(workspace, "test"));
  mkdirSync(join(workspace, "build"));
  // A test import bridge exercises the real package export map, never a substitute implementation.
  writeFileSync(join(workspace, "build/claritas-admin.js"), `export * from ${JSON.stringify(modulePackage.name)};\n`);
  writeFileSync(join(integration, "package.json"), moduleMetadata);
  writeFileSync(join(integration, "tsconfig.json"), readFileSync(join(moduleRoot, "tsconfig.json")));
  writeFileSync(join(integration, "src/index.ts"), readFileSync(join(moduleRoot, "src/index.ts")));
  writeFileSync(join(workspace, "test/claritas-admin.test.mjs"), readFileSync(join(repo, "conformance/claritas-admin.cases.mjs")));
  execFileSync(compiler, ["-p", join(integration, "tsconfig.json")], { cwd: workspace, stdio: "inherit" });
  execFileSync(process.execPath, ["--test", join(workspace, "test/claritas-admin.test.mjs")], { cwd: workspace, stdio: "inherit" });
  console.log(`Verified exact Claritas source ${lock.commit}; this is not frozen-package or production certification.`);
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
