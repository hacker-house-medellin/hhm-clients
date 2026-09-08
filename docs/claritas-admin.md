# Claritas admin activity integration — source candidate

This package exports `createActivityVisualization` at the TypeScript subpath
`@hacker-house-medellin/hhm-client/admin-viz`. It directly imports the actual
`@claritas-viz/claritas-pub-lib-core` package; it does not copy Claritas algorithms,
fetch a CDN, choose a transport, collect telemetry, or manufacture demonstration data.
Existing client entry points are unchanged. Bind this module only in a trusted
server integration, with authorization/read/audit callbacks bound to the verified
request principal. A client-side callback is not a security boundary.

## Reports and semantics

Supported measurements are check-ins (count), consented foreground app activity
(whole seconds), and recorded community contributions (count). The loader provides
one authoritative pre-aggregated measurement per entity per bucket, using opaque
IDs, a single tenant, one metric/unit, and the same half-open UTC millisecond window.
Duplicate entity/bucket measurements are rejected rather than averaged or counted
twice. Activity seconds cannot exceed the actual bucket duration. Raw location,
contact details, messages and arbitrary metadata are not accepted.

The aggregate is the **sum of observed, consented entity/bucket measurements**,
not the entity-balanced average returned by Claritas, nor a claim that every user
has been observed. Claritas determines missing/suppressed states and renders the
resulting series. The host sets the release threshold explicitly (minimum five).
Suppressed cells expose neither totals nor contributing counts. Missing and revoked
consent are not zero. No small-group breakdown or arbitrary subset aggregate is
accepted. Comparison requires exactly two distinct, independently authorized IDs;
it returns both series and the signed right-minus-left delta, null when either
measurement is missing. Charts have independent scales and say so explicitly;
use the numeric comparison table, not relative chart heights, for comparison.

Community reports are descriptive activity records, not social-creditworthiness,
rankings, eligibility, eviction, pricing or housing-access decisions. No tracking
collector, automated enforcement, sensitive inference or production database query
is introduced here.

## Host obligations before production

Authorization runs before loading and again before release. Both must return the
boolean `true`; all other results deny. The request and callback references are
snapshotted, and output is deeply frozen. Provider exceptions are sanitized. A
successful-release audit must persist before output is returned. Bind audit to the
host's request correlation context; the callback receives no raw user IDs or values.

The host must implement Shared-Auth tenant/admin/purpose/individual-view checks,
current consent and retention, revocation semantics, rate limits and overlapping
query/differencing protection. Two authorization calls are not an atomic policy
transaction or a privacy proof. Capture denied attempts in the host's security
audit. The Rust private admin service remains the policy/data boundary; this
TypeScript source does not implement or replace that service or its ORM.

Types here are in-process adapter types, not a new serialized public contract.
Any new HTTP route must first add independent TypeSpec and hand-authored JSON Schema
authorities to hhm-interfaces and pass parity/admission checks. Then add Rust/Dart
clients, route-level authorization tests, UI accessibility and real mobile consent
revocation/end-to-end tests. Do not label this source slice a production dashboard.

## Exact source test and release gate

Claritas core PR #3 is still draft. `tests/claritas-source.json` admits its exact
commit b0082e5ee2598c54a013f217cff8bac7e0ce5765 and three original files using both
Git-blob SHA-1 and SHA-256. The harness compiles the unchanged public source and
package entry point with TypeScript 5.8.3 in a temporary package workspace, then
strict-compiles and runs this adapter against it. Missing source, changed bytes,
symlinks, missing/wrong compiler, compilation failure or test failure are errors,
not skips. Private upstream source is never committed or vendored in this repository.

```sh
# CLARITAS_SOURCE_ROOT must point to an authorized checkout of the admitted core.
node --test tests/claritas-admission.test.mjs
CLARITAS_SOURCE_ROOT=/absolute/path/to/claritas-pub-lib-core node scripts/test-claritas-admin.mjs
```

Hosted CI requires existing `FLEET_GITHUB_READ_TOKEN` to have read-only access to
that private upstream; credentials are not persisted or passed into tests. The
workflow fails closed when access is absent. Existing CI gates remain intact.
The Zed dependency declaration records intended adoption, not a published package
or resolver-produced lock. Before readiness: reconcile/merge core PR #3, publish
a reviewed immutable package, resolve the actual `.zpkg.lock`, prove
`zed install --frozen` and installed export-map resolution, pass exact-head CI and
independent review, and complete the host wiring above. The host must partition caches by tenant and authorization context. No placeholder lock or
registry fallback is added. Track upstream delivery in DEN-2308 and housing integration in DEN-1950.

The existing HHM `.zpkg.lock` contains only `version = 1`; it is not a resolved
transitive dependency lock and remains unmodified, not falsely certified.
The unsupported manifest script keys `validate-layout` and `verify-matrix`
are migrated without dropping their commands to schema-v2 `zed-env.toml`.
Actual Zed CLI execution and full polyglot/SDK builds remain separate gates.
