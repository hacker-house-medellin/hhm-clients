#!/usr/bin/env bash
set -Eeuo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

bash scripts/validate-client-layout.sh
node --test tests/*.test.mjs
node --check src/index.mjs

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
if command -v cc >/dev/null 2>&1; then
  cc -std=c11 -Wall -Wextra -Werror -Iclients/c/include -c clients/c/src/client.c -o "$work/hhm-client-c.o"
else echo 'SKIP c compiler'; fi
if command -v c++ >/dev/null 2>&1; then
  printf '#include "hhm/client.hpp"\nint main(){hhm::Client c{"https://example.invalid"}; return c.endpoint("houses").empty();}\n' |
    c++ -std=c++17 -Wall -Wextra -Werror -Iclients/cpp/include -x c++ - -o "$work/hhm-client-cpp"
else echo 'SKIP c++ compiler'; fi
if command -v zig >/dev/null 2>&1; then
  zig test clients/zig/src/root.zig
else echo 'SKIP zig'; fi

if command -v cargo >/dev/null 2>&1; then
  cargo test --manifest-path clients/rust/Cargo.toml --all-targets
  cargo test --manifest-path clients/wasm/Cargo.toml --all-targets
else echo 'SKIP cargo: Rust toolchain unavailable'; fi
if command -v go >/dev/null 2>&1; then (cd clients/go && go test ./...); else echo 'SKIP go'; fi
if command -v dart >/dev/null 2>&1; then dart analyze clients/dart; else echo 'SKIP dart'; fi
if command -v gleam >/dev/null 2>&1; then (cd clients/gleam && gleam test); else echo 'SKIP gleam'; fi
if command -v rebar3 >/dev/null 2>&1; then (cd clients/erlang && rebar3 compile); else echo 'SKIP erlang/rebar3'; fi
if command -v mix >/dev/null 2>&1; then (cd clients/elixir && mix test); else echo 'SKIP elixir/mix'; fi

if command -v python3 >/dev/null 2>&1; then
  PYTHONPATH=clients/python/src python3 -m unittest discover -s clients/python/tests -p 'test_*.py'
else echo 'SKIP python3'; fi
if command -v ruby >/dev/null 2>&1; then
  ruby -Iclients/ruby/lib clients/ruby/test/client_test.rb
else echo 'SKIP ruby'; fi
if command -v php >/dev/null 2>&1; then
  php -l clients/php/src/Client.php >/dev/null
  php clients/php/tests/client_test.php
else echo 'SKIP php'; fi

if command -v javac >/dev/null 2>&1 && command -v java >/dev/null 2>&1; then
  mapfile -t java_sources < <(find clients/java/src -name '*.java' -type f | sort)
  javac -d "$work/java" "${java_sources[@]}"
  java -cp "$work/java" io.github.hackerhousemedellin.hhmclient.ClientContractTest
else echo 'SKIP java'; fi
if command -v tsc >/dev/null 2>&1 && command -v node >/dev/null 2>&1; then
  (cd clients/typescript && rm -rf dist && tsc -p tsconfig.json && node test/smoke.mjs)
else echo 'SKIP typescript: node/tsc unavailable'; fi
if command -v kotlinc >/dev/null 2>&1 && command -v java >/dev/null 2>&1; then
  mapfile -t kotlin_sources < <(find clients/kotlin/src -name '*.kt' -type f | sort)
  kotlinc "${kotlin_sources[@]}" -include-runtime -d "$work/kotlin.jar"
  java -jar "$work/kotlin.jar"
else echo 'SKIP kotlin'; fi
if command -v swift >/dev/null 2>&1; then
  swift test --package-path clients/swift
else echo 'SKIP swift'; fi
