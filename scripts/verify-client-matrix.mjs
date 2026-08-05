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
for (const dependency of ["hacker-house-medellin/hhm-interfaces", "hacker-house-medellin/hhm-libs"]) {
  if (!manifest.includes(`\"${dependency}\"`)) {
    missing.push(`dependency:${dependency}`);
  }
}

for (const target of ["nodejs", "deno", "bun", "edge", "python3", "rust-wasm", "gleamlang"]) {
  if (!manifest.includes(`[targets.${target}]`)) {
    missing.push(`target:${target}`);
  }
}

if (missing.length > 0) {
  console.error(`Missing required client surfaces: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(
  `Validated ${Object.keys(matrix.languages).length} language surfaces and ${Object.keys(matrix.typescriptRuntimes).length} TypeScript runtimes.`,
);
