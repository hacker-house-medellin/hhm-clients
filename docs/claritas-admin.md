# Claritas admin activity integration — source candidate

The private package `@hacker-house-medellin/hhm-admin-viz` lives in
`integrations/claritas` and exports `createActivityVisualization`. It directly
imports the real `@claritas-viz/claritas-pub-lib-core` peer. The public client
package, its exports and its contract receipts remain unchanged. This separation
keeps server policy hooks and an unpublished dependency out of public SDK builds.
There is no algorithm copy, CDN, implicit transport, tracking collector or demo data.

## Semantics and protection

Input is one authoritative measurement per entity/bucket: check-ins (count),
consented foreground activity (whole seconds), or recorded community contributions
(count). The same tenant, metric, unit and half-open UTC millisecond window apply
throughout. Duplicate entity/bucket values, raw metadata, malformed IDs, foreign
tenants, unrequested comparison entities, and oversized inputs are rejected.
Limits are 50,000 rows, 1,000 buckets and nonnegative integer measurements at most
1,000,000,000. Activity seconds cannot exceed the actual final bucket duration.

Organization charts show the **sum of observed consented measurements**, not the
entity-balanced average computed by Claritas or a claim that everyone was observed.
Claritas determines suppression/missing states and renders actual SVG output. The
server supplies a release threshold of at least five; suppressed cells disclose
neither totals nor counts. Missing/revoked consent is not zero. Aggregate requests
cannot choose arbitrary user subsets. Two-user comparison requires distinct IDs,
returns right-minus-left deltas only when both values exist, and explicitly labels
its independent chart scales. Use the numeric table for visual comparisons.

Community records are descriptive, not social-creditworthiness scores, rankings,
eligibility, pricing, eviction or housing-access decisions. No location collection,
sensitive inference, automated enforcement or production query is introduced.

## Host obligations

Bind authorize/read/audit callbacks to a verified request principal on a trusted
server; browser callbacks do not establish authorization. Authorization must return
literal true before loading and again before release. Successful-release audit must
persist before output is returned. Requests, callbacks and results are snapshotted;
provider errors are sanitized. The host must enforce Shared-Auth tenant/admin and
individual-view permissions, purpose, current consent/retention, revocation, query
budgets and protection against overlapping-query differencing. Two authorization
calls are not an atomic policy transaction or a privacy proof. Partition caches by
tenant and authorization context; record denied attempts in the host security audit.

The Rust private admin service remains the policy/data boundary. These are in-process
adapter types, not a new HTTP contract. Any new route needs independent TypeSpec and
hand-authored JSON Schema authorities in `hhm-interfaces`, parity/admission tests,
Rust/Dart bindings, actual ORM queries and native/mobile/route/UI end-to-end coverage.
This source slice is not a deployed dashboard or a complete mobile tracking system.

## Verification and release gates

`tests/claritas-source.json` admits core PR #3 commit
`32a40bbe302c7596d778b686530338595af8653d` using Git-blob SHA-1 and SHA-256 for its
original entry point, geometry helper, cohort renderer and package metadata. The harness compiles those
unchanged sources with TypeScript 5.8.3, builds the private integration using its
committed tsconfig, and exercises its actual package export map. Upstream private
source is never committed to this repository. Missing/changed/symlinked source,
compiler mismatch or failed tests cause failure rather than skipping or substitution.

`conformance/claritas-admin.cases.mjs` holds the 45 runtime cases outside uncompiled
Node test discovery. The mandatory source job builds and runs all cases. Three
source-admission and three layout regression tests also run without credentials.

```sh
node --test tests/claritas-admission.test.mjs tests/claritas-layout.test.mjs
CLARITAS_SOURCE_ROOT=/absolute/path/to/approved-core-checkout node scripts/test-claritas-admin.mjs
```

Hosted source integration requires read-only `FLEET_GITHUB_READ_TOKEN` access to the
private upstream; missing access fails closed. No secret value is embedded or passed
to tests. Existing CI gates are preserved. The root Zed dependency and the private
package peer record intended adoption, not a published package or resolved lock.
Keep draft until reviewed immutable publication, actual resolver-generated lock and
`zed install --frozen`, exact-head CI, independent review, and host obligations pass.
The package export-map test is source-workspace evidence, not registry-install proof.
Track upstream delivery in DEN-2308.

HHM integration is also tracked in DEN-1950. Its existing `.zpkg.lock` contains
only `version = 1` and remains unmodified, not certified. Unsupported manifest
script keys `validate-layout` and `verify-matrix` moved to schema-v2 `zed-env.toml`
with both original commands preserved. Full Zed/polyglot execution is a separate gate.
