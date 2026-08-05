import assert from "node:assert/strict";
import { Client } from "../dist/src/index.js";

let observed;
const client = new Client({
  baseUrl: "https://api.example.com/",
  token: "secret",
  fetchImpl: async (input, init) => {
    observed = { input: String(input), init };
    return new Response('{"ok":true}', { status: 200, headers: { "content-type": "application/json" } });
  },
});
assert.deepEqual(await client.health(), { ok: true });
assert.equal(observed.input, "https://api.example.com/healthz");
assert.equal(observed.init.method, "GET");
assert.equal(observed.init.headers.get("authorization"), "Bearer secret");
console.log("typescript client contract ok");
