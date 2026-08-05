import { access, readFile } from "node:fs/promises";

const matrix = JSON.parse(await readFile(new URL("../clients/matrix.json", import.meta.url), "utf8"));
const missing = [];
for (const [language, spec] of Object.entries(matrix.languages)) {
  try { await access(new URL(`../${spec.dir}/${spec.sentinel}`, import.meta.url)); }
  catch { missing.push(`${language}:${spec.dir}/${spec.sentinel}`); }
}
for (const [runtime, path] of Object.entries(matrix.typescriptRuntimes)) {
  try { await access(new URL(`../${path}`, import.meta.url)); }
  catch { missing.push(`typescript-${runtime}:${path}`); }
}
const manifest = await readFile(new URL("../.zpkg.toml", import.meta.url), "utf8");
for (const dependency of ["hacker-house-medellin/hhm-interfaces", "hacker-house-medellin/hhm-libs"]) {
  if (!manifest.includes(`\"${dependency}\"`)) missing.push(`dependency:${dependency}`);
}
if (missing.length) { console.error(`Missing required client surfaces: ${missing.join(", ")}`); process.exit(1); }
console.log(`Validated ${Object.keys(matrix.languages).length} languages and ${Object.keys(matrix.typescriptRuntimes).length} TypeScript runtimes.`);
