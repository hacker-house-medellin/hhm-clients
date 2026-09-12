# Claritas admin activity integration — source candidate

The private package `@hacker-house-medellin/hhm-admin-viz` in `integrations/claritas`
imports the actual Claritas public core. Public SDK exports and contract receipts
are unchanged. No renderer copy, implicit network transport, synthetic data or
production dashboard activation is introduced.

## Aggregate and comparison semantics

Supply one authoritative measurement per entity per UTC bucket: check-ins (count),
consented foreground activity (whole seconds), or recorded contributions (count).
Tenant, metric, unit and half-open time window must match. Duplicate measurements,
foreign tenants, malformed IDs, unknown fields, non-data properties and oversized
inputs fail. Limits remain 50,000 rows, 1,000 buckets, and nonnegative integer values
at most 1e9; activity seconds must fit the actual bucket duration.

Aggregates sum observed consented measurements, not entity means or a claim of total
population coverage. At least the explicitly configured minimum of five contributors
is required; suppressed cells omit values/counts, and missing is not zero. Comparisons
require exactly two distinct independently authorized IDs. Original `charts`,
`comparison` and `scale` fields retain their previous semantics.

The additive `pairedView` is null for aggregates. For comparisons it contains the
actual Claritas `comparisonView` output: common-scale geometry, an inert SVG with
solid/filled left marks and dashed/hollow right marks, and a complete accessible
numeric HTML table. Deltas are right minus left only where both observations exist.
Nulls break lines independently. The geometry helper has Rust and Dart counterparts;
this does not establish native housing-app rendering or new public wire contracts.

## Input and authorization hardening

Closed request/measurement objects reject unknown hidden/symbol members and accessor
properties. Selector arrays use own data descriptors, not caller-controlled iterators.
The request, callback references and output remain immutable snapshots. Provider
errors are reconstructed with a safe code, fixed message and no arbitrary attached
fields; error-code accessors are not invoked.

Authorize/read/audit callbacks must be bound to a verified server principal. Literal
true authorization is required before loading and again before release; audit must
persist before returning either old or new outputs. These callbacks are not an auth
implementation. The private Rust admin service must enforce Shared-Auth tenant/admin,
purpose and individual-view permission, consent/retention and revocation, query-budget
and differencing protection, cache partitioning and denied-request auditing. Two
checks are not an atomic policy transaction or anonymity proof.

These community records are not social-creditworthiness scores, rankings, pricing,
housing-access or eviction decisions. No raw location/communications collector,
sensitive inference, ORM query or automatic enforcement is added. Database/ORM work
stays in the private sibling core; new routes need independent TypeSpec and authored
JSON Schema parity in `hhm-interfaces`, followed by real Rust/Dart and UI tests.

## Reproduction and evidence boundary

`tests/claritas-source.json` is the exact five-file source admission manifest.
It pins Claritas `91e9bc24ae90019a9e8238c5035af1513a7cf2cf`, including the preserved
rolling-mean fix and new paired-series module, using Git-blob SHA-1 and SHA-256.
The harness builds the real core entry point and private integration package and
executes both conformance files through the actual package export map. Missing,
changed or symlinked source, wrong compiler or failing tests fail rather than skip.
No upstream private source is committed to this consumer repository.

`conformance/claritas-admin.cases.mjs` preserves the original 45 cases unchanged;
`conformance/claritas-interop.cases.mjs` adds 24 tests. All 69 executed locally with
Node 22.16.0 and TypeScript 5.8.3. Existing admission/layout checks remain separate.

`CLARITAS_SOURCE_ROOT=/absolute/approved/core node scripts/test-claritas-admin.mjs`

Hosted source CI still requires approved read-only `FLEET_GITHUB_READ_TOKEN` access.
No credential was added or gate disabled. The root Zed declaration and package peer
are not proof of a published release or resolved lock. Keep draft pending exact-head
full/native CI and independent review, reviewed immutable package publication, actual
resolver-produced lock and `zed install --frozen`, plus private service, mobile,
consent-revocation and admin UI/API end-to-end acceptance. No deployment is claimed.
Tracking: DEN-2308 and DEN-1950.
