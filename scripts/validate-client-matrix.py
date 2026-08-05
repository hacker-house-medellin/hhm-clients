#!/usr/bin/env python3
from pathlib import Path
import sys
import tomllib

ROOT = Path(__file__).resolve().parents[1]
DEPENDENCIES = {'hacker-house-medellin/hhm-libs', 'hacker-house-medellin/hhm-interfaces'}
TARGETS = {'gleam': 'clients/gleam', 'erlang': 'clients/erlang', 'elixir': 'clients/elixir', 'dart': 'clients/dart', 'rust': 'clients/rust', 'java': 'clients/java', 'golang': 'clients/go', 'python': 'clients/python', 'ruby': 'clients/ruby', 'php': 'clients/php', 'nodejs': 'clients/typescript/nodejs', 'deno': 'clients/typescript/deno', 'bun': 'clients/typescript/bun', 'edge': 'clients/typescript/edge'}
FIELDS = {"org", "name", "version", "description", "license"}

def fail(message: str) -> None:
    print(f"client-matrix: {message}", file=sys.stderr)
    raise SystemExit(1)

data = tomllib.loads((ROOT / ".zpkg.toml").read_text())
package = data.get("package")
if not isinstance(package, dict) or FIELDS - package.keys(): fail("invalid [package]")
repository = package.get("repository")
if not isinstance(repository, dict) or repository.get("vcs") != "git" or not repository.get("url"): fail("invalid [package.repository]")
if data.get("install", {}).get("dir") != ".vendor/.zed": fail("invalid [install].dir")
dependencies = data.get("dependencies", {})
missing = DEPENDENCIES - dependencies.keys()
if missing: fail(f"missing dependencies: {sorted(missing)}")
targets = data.get("targets", {})
for name, expected in TARGETS.items():
    if targets.get(name, {}).get("dir") != expected: fail(f"invalid target {name}")
    directory = ROOT / expected
    if not directory.is_dir() or not any(p.is_file() for p in directory.rglob("*")): fail(f"empty target {name}")
print(f"client-matrix: OK ({len(TARGETS)} targets)")
