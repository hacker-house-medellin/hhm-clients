import assert from 'node:assert/strict';
import test from 'node:test';
import { createClient, product, ApiError } from '../src/index.mjs';

test('product metadata is exported', () => {
  assert.equal(product.slug, "hacker-house-medellin");
  assert.ok(product.capabilities.includes('events'));
});

test('client serializes JSON and auth headers', async () => {
  const calls = [];
  const client = createClient({ baseUrl: 'https://edge.example.test/', token: 'test-token', fetchImpl: async (url, init) => { calls.push({ url, init }); return new Response(JSON.stringify({ ok: true, url }), { status: 200 }); } });
  const result = await client.emitEvent({ type: 'demo' });
  assert.equal(result.ok, true);
  assert.equal(calls[0].url, 'https://edge.example.test/api/events');
  assert.equal(calls[0].init.headers.get('authorization'), 'Bearer test-token');
});

test('client throws structured errors', async () => {
  const client = createClient({ baseUrl: 'https://edge.example.test', fetchImpl: async () => new Response(JSON.stringify({ error: 'nope' }), { status: 418 }) });
  await assert.rejects(() => client.health(), ApiError);
});
