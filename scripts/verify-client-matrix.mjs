import { access, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const matrix = JSON.parse(await readFile(new URL("clients/matrix.json", root), "utf8"));
const missing = [];

for (const [language, spec] of Object.entries(matrix.languages)) {
  try {
    await access(new URL(`${spec.dir}/${spec.sentinel}`, root));
  } catch {
    missing.push(`${language}:${spec.dir}/${spec.sentinel}`);
  }
}

for (const [runtime, path] of Object.entries(matrix.typescriptRuntimes)) {
  try {
    await access(new URL(path, root));
  } catch {
    missing.push(`typescript-${runtime}:${path}`);
  }
}

const manifest = await readFile(new URL(".zpkg.toml", root), "utf8");
const lock = await readFile(new URL(".zpkg.lock", root), "utf8");

for (const dependency of ["hacker-house-medellin/hhm-interfaces", "hacker-house-medellin/hhm-libs"]) {
  if (!manifest.includes(`\"${dependency}\"`)) {
    missing.push(`dependency:${dependency}`);
  }
}

const canonicalTargets = new Map([
  ["repository", "."],
  ["c", "clients/c"],
  ["cpp", "clients/cpp"],
  ["zig", "clients/zig"],
  ["nodejs", "clients/typescript"],
  ["golang", "clients/go"],
  ["python", "clients/python"],
  ["ruby", "clients/ruby"],
  ["php", "clients/php"],
  ["rust", "clients/rust"],
  ["rust-wasm", "clients/wasm"],
  ["dart", "clients/dart"],
  ["gleam", "clients/gleam"],
  ["erlang", "clients/erlang"],
  ["elixir", "clients/elixir"],
  ["java", "clients/java"],
  ["kotlin", "clients/kotlin"],
  ["swift", "clients/swift"],
]);

const headers = [...manifest.matchAll(/^\[targets\.([^\]]+)\]\s*$/gm)];
const declaredTargets = new Set(headers.map((match) => match[1]));
for (const target of canonicalTargets.keys()) {
  if (!declaredTargets.has(target)) missing.push(`target:${target}`);
}
for (const target of declaredTargets) {
  if (!canonicalTargets.has(target)) missing.push(`noncanonical-target:${target}`);
}

for (let index = 0; index < headers.length; index += 1) {
  const match = headers[index];
  const target = match[1];
  if (!canonicalTargets.has(target)) continue;
  const start = match.index + match[0].length;
  const end = headers[index + 1]?.index ?? manifest.length;
  const block = manifest.slice(start, end);
  const expectedDir = canonicalTargets.get(target);
  if (!block.includes(`dir = \"${expectedDir}\"`)) {
    missing.push(`target-dir:${target}:${expectedDir}`);
  }
}

if (/^language\s*=\s*\"polyglot\"\s*$/m.test(manifest)) {
  missing.push("manifest:noncanonical-polyglot-language");
}
if (!/^version\s*=\s*1\s*$/m.test(lock)) {
  missing.push("lock:version-1");
}

if (missing.length > 0) {
  console.error(`Missing or invalid client surfaces: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(
  `Validated ${Object.keys(matrix.languages).length} language surfaces, ${Object.keys(matrix.typescriptRuntimes).length} TypeScript runtimes, and canonical Zed targets.`,
);
