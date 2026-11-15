# AttoLang SDK surface (phase 1)

`src/hhm_client.atto` provides typed pure functions for HTTP method and URL path selection. It follows AttoLang's `pub fnc name(): string { return ...; }` source syntax and snake_case naming. The contract mirrors `ServiceClient` in `../../src/index.mjs`.

| Operation | Method | Path |
| --- | --- | --- |
| `health` | `GET` | `/healthz` |
| `ready` | `GET` | `/readyz` |
| `config` | `GET` | `/api/config` |
| `emit_event` | `POST` | `/api/events` |
| `create_lead` | `POST` | `/api/leads` |
| `create_alert` | `POST` | `/api/alerts` |

## Host transport boundary

Consumers must inject an HTTP transport outside the descriptors; they must serialize JSON request bodies, send `Accept: application/json`, attach bearer authentication only when configured, and propagate non-2xx responses as structured errors. Do not embed credentials or claim that these pure functions perform network I/O. The authoritative wire schemas are in `hacker-house-medellin/hhm-interfaces`.

Run `node --test tests/atto-client.test.mjs` from the repository root. This is a **static contract and JavaScript interop test**, not an Atto compiler or guest-runtime test. Before promoting to a working Atto SDK, run the actual Atto compiler on a pinned head with positive and negative fixtures and an injected transport conformance suite.
