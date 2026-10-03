# hacker-house-medellin/hhm-clients#10 — chore: nightly polyglot client hardening

head: automation/nightly-client-hardening  base: main  author: ORESoftware  updated: 2026-08-28T22:27:11Z
dir: /Users/maca5/codes/.claude-fleet/scratch/merge/hacker-house-medellin_hhm-clients__10

## conflicted files
- clients/.api-surface.sha256
- clients/api-surface.json
- clients/c/.zed-api-surface.sha256
- clients/c/.zed-client-contract.json
- clients/client-api.schema.json
- clients/contract-manifest.json
- clients/cpp/.zed-api-surface.sha256
- clients/cpp/.zed-client-contract.json
- clients/dart/.zed-api-surface.sha256
- clients/dart/.zed-client-contract.json
- clients/elixir/.zed-api-surface.sha256
- clients/elixir/.zed-client-contract.json
- clients/erlang/.zed-api-surface.sha256
- clients/erlang/.zed-client-contract.json
- clients/gleam/.zed-api-surface.sha256
- clients/gleam/.zed-client-contract.json
- clients/golang/.zed-api-surface.sha256
- clients/golang/.zed-client-contract.json
- clients/java/.zed-api-surface.sha256
- clients/java/.zed-client-contract.json
- clients/kotlin/.zed-api-surface.sha256
- clients/kotlin/.zed-client-contract.json
- clients/php/.zed-api-surface.sha256
- clients/php/.zed-client-contract.json
- clients/python/.zed-api-surface.sha256
- clients/python/.zed-client-contract.json
- clients/ruby/.zed-api-surface.sha256
- clients/ruby/.zed-client-contract.json
- clients/rust/.zed-api-surface.sha256
- clients/rust/.zed-client-contract.json
- clients/swift/.zed-api-surface.sha256
- clients/swift/.zed-client-contract.json
- clients/typescript/.zed-contracts/nodejs/.zed-api-surface.sha256
- clients/typescript/.zed-contracts/nodejs/.zed-client-contract.json
- clients/typescript/bun/.zed-api-surface.sha256
- clients/typescript/bun/.zed-client-contract.json
- clients/typescript/deno/.zed-api-surface.sha256
- clients/typescript/deno/.zed-client-contract.json
- clients/typescript/edge/.zed-api-surface.sha256
- clients/typescript/edge/.zed-client-contract.json
- clients/wasm/.zed-api-surface.sha256
- clients/wasm/.zed-client-contract.json
- clients/zig/.zed-api-surface.sha256
- clients/zig/.zed-client-contract.json

## base (main) last 8 commits
30ff0ee Merge pull request #13 from hacker-house-medellin/agent/den-3587-canonical-client-schema
8a173d9 DEN-3587 Adopt the canonical JSON Schema client contract.
d27f005 Merge branch 'agent-sync/20260823/main' into main
ad2db2a ci: add pre-build JS and Rust source lint
7cb4e68 ci: add pre-build JS and Rust source lint
e4ca3d7 ci: add pre-build JS and Rust source lint
52723e1 chore: ignore tmp/temp worktree scratch directories
7b3de58 Merge remote:agent/polyglot-client-matrix-20260805 into main with semantic hunk reconciliation

## head (automation/nightly-client-hardening) last 8 commits
01ab617 feat: harden canonical polyglot client contract
7b3de58 Merge remote:agent/polyglot-client-matrix-20260805 into main with semantic hunk reconciliation
a637a99 Merge remote:agent/full-polyglot-client-matrix into main with semantic hunk reconciliation
54894f3 Merge remote:agent/standardize-zed-client-matrix-20260805 into main
a49627f chore: ignore generated client build caches
2d17075 Prefer primary branches and avoid agent worktrees
cd3478e feat(clients): add C, C++, and Zig SDK slices (#9)
0e61ddf feat: standardize Zed clients package [skip ci]

## merge-base: 7b3de58a39270b434b7bd9e278ec943a9df4250a

## PR diff stat (merge-base..head)
 clients/golang/.zed-api-surface.sha256             |   1 +
 clients/golang/.zed-client-contract.json           |  10 +
 clients/java/.zed-api-surface.sha256               |   1 +
 clients/java/.zed-client-contract.json             |  10 +
 clients/kotlin/.zed-api-surface.sha256             |   1 +
 clients/kotlin/.zed-client-contract.json           |  10 +
 clients/php/.zed-api-surface.sha256                |   1 +
 clients/php/.zed-client-contract.json              |  10 +
 clients/python/.zed-api-surface.sha256             |   1 +
 clients/python/.zed-client-contract.json           |  10 +
 clients/ruby/.zed-api-surface.sha256               |   1 +
 clients/ruby/.zed-client-contract.json             |  10 +
 clients/rust/.zed-api-surface.sha256               |   1 +
 clients/rust/.zed-client-contract.json             |  10 +
 clients/sdk-matrix.json                            | 109 ++++
 clients/swift/.zed-api-surface.sha256              |   1 +
 clients/swift/.zed-client-contract.json            |  10 +
 .../.zed-contracts/nodejs/.zed-api-surface.sha256  |   1 +
 .../nodejs/.zed-client-contract.json               |  10 +
 clients/typescript/bun/.zed-api-surface.sha256     |   1 +
 clients/typescript/bun/.zed-client-contract.json   |  10 +
 clients/typescript/deno/.zed-api-surface.sha256    |   1 +
 clients/typescript/deno/.zed-client-contract.json  |  10 +
 clients/typescript/edge/.zed-api-surface.sha256    |   1 +
 clients/typescript/edge/.zed-client-contract.json  |  10 +
 clients/wasm/.zed-api-surface.sha256               |   1 +
 clients/wasm/.zed-client-contract.json             |  10 +
 clients/zig/.zed-api-surface.sha256                |   1 +
 clients/zig/.zed-client-contract.json              |  10 +
 47 files changed, 1715 insertions(+), 28 deletions(-)

## base diff stat (merge-base..base)
 clients/php/.zed-api-surface.sha256                |    1 +
 clients/php/.zed-client-contract.json              |   10 +
 clients/python/.zed-api-surface.sha256             |    1 +
 clients/python/.zed-client-contract.json           |   10 +
 clients/python3/.zed-api-surface.sha256            |    1 +
 clients/python3/.zed-client-contract.json          |   10 +
 clients/ruby/.zed-api-surface.sha256               |    1 +
 clients/ruby/.zed-client-contract.json             |   10 +
 clients/rust/.zed-api-surface.sha256               |    1 +
 clients/rust/.zed-client-contract.json             |   10 +
 clients/swift/.zed-api-surface.sha256              |    1 +
 clients/swift/.zed-client-contract.json            |   10 +
 .../.zed-contracts/nodejs/.zed-api-surface.sha256  |    1 +
 .../nodejs/.zed-client-contract.json               |   10 +
 clients/typescript/bun/.zed-api-surface.sha256     |    1 +
 clients/typescript/bun/.zed-client-contract.json   |   10 +
 clients/typescript/deno/.zed-api-surface.sha256    |    1 +
 clients/typescript/deno/.zed-client-contract.json  |   10 +
 clients/typescript/edge/.zed-api-surface.sha256    |    1 +
 clients/typescript/edge/.zed-client-contract.json  |   10 +
 clients/wasm/.zed-api-surface.sha256               |    1 +
 clients/wasm/.zed-client-contract.json             |   10 +
 clients/zig/.zed-api-surface.sha256                |    1 +
 clients/zig/.zed-client-contract.json              |   10 +
 schemas/client-api.schema.json                     |  718 +++++++++
 scripts/client_contract_boundary.py                |  123 ++
 scripts/harden_client_contract.py                  | 1573 ++++++++++++++++++++
 scripts/verify_client_contract.py                  |  279 ++++
 tests/test_client_contract_boundary.py             |   50 +
 58 files changed, 4687 insertions(+)

## merge output
Auto-merging clients/.api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/.api-surface.sha256
Auto-merging clients/api-surface.json
CONFLICT (add/add): Merge conflict in clients/api-surface.json
Auto-merging clients/c/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/c/.zed-api-surface.sha256
Auto-merging clients/c/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/c/.zed-client-contract.json
Auto-merging clients/client-api.schema.json
CONFLICT (add/add): Merge conflict in clients/client-api.schema.json
Auto-merging clients/contract-manifest.json
CONFLICT (add/add): Merge conflict in clients/contract-manifest.json
Auto-merging clients/cpp/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/cpp/.zed-api-surface.sha256
Auto-merging clients/cpp/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/cpp/.zed-client-contract.json
Auto-merging clients/dart/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/dart/.zed-api-surface.sha256
Auto-merging clients/dart/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/dart/.zed-client-contract.json
Auto-merging clients/elixir/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/elixir/.zed-api-surface.sha256
Auto-merging clients/elixir/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/elixir/.zed-client-contract.json
Auto-merging clients/erlang/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/erlang/.zed-api-surface.sha256
Auto-merging clients/erlang/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/erlang/.zed-client-contract.json
Auto-merging clients/gleam/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/gleam/.zed-api-surface.sha256
Auto-merging clients/gleam/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/gleam/.zed-client-contract.json
Auto-merging clients/golang/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/golang/.zed-api-surface.sha256
Auto-merging clients/golang/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/golang/.zed-client-contract.json
Auto-merging clients/java/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/java/.zed-api-surface.sha256
Auto-merging clients/java/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/java/.zed-client-contract.json
Auto-merging clients/kotlin/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/kotlin/.zed-api-surface.sha256
Auto-merging clients/kotlin/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/kotlin/.zed-client-contract.json
Auto-merging clients/php/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/php/.zed-api-surface.sha256
Auto-merging clients/php/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/php/.zed-client-contract.json
Auto-merging clients/python/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/python/.zed-api-surface.sha256
Auto-merging clients/python/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/python/.zed-client-contract.json
Auto-merging clients/ruby/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/ruby/.zed-api-surface.sha256
Auto-merging clients/ruby/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/ruby/.zed-client-contract.json
Auto-merging clients/rust/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/rust/.zed-api-surface.sha256
Auto-merging clients/rust/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/rust/.zed-client-contract.json
Auto-merging clients/swift/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/swift/.zed-api-surface.sha256
Auto-merging clients/swift/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/swift/.zed-client-contract.json
Auto-merging clients/typescript/.zed-contracts/nodejs/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/typescript/.zed-contracts/nodejs/.zed-api-surface.sha256
Auto-merging clients/typescript/.zed-contracts/nodejs/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/typescript/.zed-contracts/nodejs/.zed-client-contract.json
Auto-merging clients/typescript/bun/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/typescript/bun/.zed-api-surface.sha256
Auto-merging clients/typescript/bun/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/typescript/bun/.zed-client-contract.json
Auto-merging clients/typescript/deno/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/typescript/deno/.zed-api-surface.sha256
Auto-merging clients/typescript/deno/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/typescript/deno/.zed-client-contract.json
Auto-merging clients/typescript/edge/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/typescript/edge/.zed-api-surface.sha256
Auto-merging clients/typescript/edge/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/typescript/edge/.zed-client-contract.json
Auto-merging clients/wasm/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/wasm/.zed-api-surface.sha256
Auto-merging clients/wasm/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/wasm/.zed-client-contract.json
Auto-merging clients/zig/.zed-api-surface.sha256
CONFLICT (add/add): Merge conflict in clients/zig/.zed-api-surface.sha256
Auto-merging clients/zig/.zed-client-contract.json
CONFLICT (add/add): Merge conflict in clients/zig/.zed-client-contract.json
Automatic merge failed; fix conflicts and then commit the result.
