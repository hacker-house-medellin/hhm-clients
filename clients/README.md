# Hacker House Medellín client matrix

Every SDK exposes `health`, `ready`, `config`, `emitEvent`, `createLead`, `createAlert`, and a generic authenticated request primitive. Shared contracts and runtime-light domain behavior come from the sibling `hhm-interfaces` and `hhm-libs` Zed packages.

The TypeScript SDK has explicit Node.js, Deno, Bun, and edge-runtime entry points. Kotlin and Swift are first-class because applications for residents, visitors, hosts, events, and community operations are mobile-facing.

`matrix.json` is the machine-readable source of truth and is validated in CI.
