# Architecture

`hhm-clients` contains generated and hand-written Hacker House Medellín clients for supported application runtimes.

## Canonical package fleet

- `hhm-interfaces` owns wire formats and generated contract types.
- `hhm-libs` owns reusable, runtime-light domain behavior.
- `hhm-clients` consumes versioned interfaces and exposes language-specific SDKs.
- `hhm-sync` owns offline-first reconciliation boundaries.
- `hhm-api` and the MASH, Leptos, and Dioxus web runtimes own deployment behavior.
- `hhm-cli` composes clients, interfaces, and libraries for operator workflows.
- `hhm-infra` owns deployment configuration.
- `hhm-monorepo` coordinates pinned revisions without becoming a second package identity.

The long-name bootstrap repositories are historical aliases, not package sources. New dependencies must use the short `hacker-house-medellin/hhm-*` coordinates.

## Zed and Git submodules

Prefer Zed for reusable dependency resolution. A repository retained as a Git submodule must have an explicit editable-workspace, inventory, embedded-source, experiment-reference, or legacy role. Do not represent the same repository as both a Zed dependency and a gitlink in one composition.

A root `.zpkg.toml` allows `zed overtake --git-submodules` to adopt an exact gitlink while preserving `.gitmodules`. Edge code is allowlisted and never a generic proxy.
