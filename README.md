# hhm-clients

Polyglot client SDKs for **Hacker House Medellín**. The repository is intentionally transport-oriented: generated and handwritten clients share one endpoint contract while each language keeps idiomatic authentication, retries, and error handling.

## Layout

- `src/` — dependency-free JavaScript reference client and contract tests
- `clients/rust/` — Rust URL/request builder with transport injection
- `clients/go/` — Go `net/http` client
- `clients/dart/` — Dart URI and request contract package
- `clients/gleam/` — Gleam endpoint helpers
- `clients/erlang/` — Erlang endpoint helpers
- `clients/wasm/` — dependency-free Rust/WASM ABI package
- `openapi/` — canonical edge API description used for generation

## JavaScript

```js
import { createClient } from '@hacker-house-medellin/hhm-clients';

const client = createClient({ baseUrl: 'https://api.example.com', token: process.env.API_TOKEN });
const status = await client.health();
```

## Validation

```bash
./scripts/test.sh
```

The script runs every toolchain available locally and leaves unavailable language ecosystems to CI/toolchain-specific jobs.
