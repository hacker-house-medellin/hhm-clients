#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"
node scripts/verify-client-matrix.mjs
node --test tests/*.test.mjs
node --check src/index.mjs
node --check clients/typescript/src/index.js
if command -v cargo >/dev/null 2>&1; then cargo test --manifest-path clients/rust/Cargo.toml --all-targets; cargo test --manifest-path clients/wasm/Cargo.toml --all-targets; fi
if command -v go >/dev/null 2>&1; then (cd clients/go && go test ./...); fi
if command -v dart >/dev/null 2>&1; then dart analyze clients/dart; fi
if command -v gleam >/dev/null 2>&1; then (cd clients/gleam && gleam test); fi
if command -v rebar3 >/dev/null 2>&1; then (cd clients/erlang && rebar3 compile); fi
if command -v python3 >/dev/null 2>&1; then python3 -m compileall -q clients/python3/src; fi
if command -v ruby >/dev/null 2>&1; then ruby -c clients/ruby/lib/hhm_client.rb; fi
if command -v php >/dev/null 2>&1; then php -l clients/php/src/ServiceClient.php; fi
if command -v javac >/dev/null 2>&1; then tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT; javac -d "$tmp" clients/java/src/main/java/com/hackerhousemedellin/client/ServiceClient.java; fi
