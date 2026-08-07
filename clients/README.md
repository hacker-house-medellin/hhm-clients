# hhm client SDKs

These runtime-specific SDK baselines depend on the `hhm-interfaces`
and `hhm-lib` Zed packages. Existing product bindings are preserved;
missing targets receive a transport-neutral client configuration baseline.
# Hacker House Medellín client matrix

Every SDK exposes `health`, `ready`, `config`, `emitEvent`, `createLead`, `createAlert`, and a generic authenticated request primitive. Shared contracts and runtime-light domain behavior come from the sibling `hhm-interfaces` and `hhm-libs` Zed packages.

The TypeScript SDK has explicit Node.js, Deno, Bun, and edge-runtime entry points. Kotlin and Swift are first-class because applications for residents, visitors, hosts, events, and community operations are mobile-facing.

`matrix.json` is the machine-readable source of truth and is validated in CI.
# Hacker House Medellín client matrix

This Zed package depends on `hacker-house-medellin/hhm-interfaces` and `hacker-house-medellin/hhm-libs` and exposes isolated
targets for Gleam, Erlang, Elixir, Dart, Rust, Java, Go, Python 3, Ruby, PHP, and
TypeScript for Node.js, Deno, Bun, and edge runtimes. Kotlin and Swift are not advertised until this family has a mobile surface.

Run `python3 scripts/validate-client-matrix.py` before publishing.
