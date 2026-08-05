#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"
node --test tests/*.test.mjs
node --check src/index.mjs
if command -v cargo >/dev/null 2>&1; then
  cargo test --manifest-path clients/rust/Cargo.toml --all-targets
  cargo test --manifest-path clients/wasm/Cargo.toml --all-targets
fi
if command -v go >/dev/null 2>&1; then (cd clients/go && go test ./...); fi
if command -v dart >/dev/null 2>&1; then dart analyze clients/dart; fi
if command -v gleam >/dev/null 2>&1; then (cd clients/gleam && gleam test); fi
if command -v rebar3 >/dev/null 2>&1; then (cd clients/erlang && rebar3 compile); fi
