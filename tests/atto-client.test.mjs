import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createClient } from '../src/index.mjs';

const source = readFileSync(new URL('../clients/atto/src/hhm_client.atto', import.meta.url), 'utf8');
const routes = {
  health: { method: 'GET', path: '/healthz', js: 'health' },
  ready: { method: 'GET', path: '/readyz', js: 'ready' },
  config: { method: 'GET', path: '/api/config', js: 'config' },
  emit_event: { method: 'POST', path: '/api/events', js: 'emitEvent' },
  create_lead: { method: 'POST', path: '/api/leads', js: 'createLead' },
  create_alert: { method: 'POST', path: '/api/alerts', js: 'createAlert' },
};

function atto_literal(name) {
  const match = source.match(new RegExp('pub\\s+fnc\\s+' + name + '\\(\\):\\s*string\\s*\\{\\s*return\\s+"([^"\\n]+)";\\s*\\}', 'g'));
  assert.equal(match?.length, 1, 'missing or duplicate typed Atto function: ' + name);
  return /return\s+"([^"]+)";/.exec(match[0])[1];
}

test('Atto functions have one typed descriptor for each API operation', () => {
  const declared = [...source.matchAll(/pub\s+fnc\s+(\w+)\(\):\s*string/g)].map(x => x[1]).sort();
  const expected = Object.keys(routes).flatMap(name => [name + '_path', name + '_method']).sort();
  assert.deepEqual(declared, expected);
  for (const [name, route] of Object.entries(routes)) {
    assert.equal(atto_literal(name + '_path'), route.path);
    assert.equal(atto_literal(name + '_method'), route.method);
    assert.match(route.path, /^\/(?!\/)[a-z\/]+$/);
  }
});

test('Atto method and path descriptors match the injected JavaScript transport', async () => {
  const calls = [];
  const client = createClient({ baseUrl: 'https://example.invalid/', fetchImpl: async (url, init) => {
    calls.push({ url, method: init.method });
    return new Response('{}', { status: 200 });
  } });
  for (const [name, route] of Object.entries(routes)) {
    await client[route.js](route.method === 'POST' ? { sample: true } : undefined);
    const call = calls.at(-1);
    assert.equal(call.url, 'https://example.invalid' + atto_literal(name + '_path'));
    assert.equal(call.method, atto_literal(name + '_method'));
  }
});
