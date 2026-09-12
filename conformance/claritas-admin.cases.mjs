import test from "node:test";
import assert from "node:assert/strict";
import { APPLICATION_SCOPE, createActivityVisualization, ActivityVisualizationError } from "../build/claritas-admin.js";
const scope = "hacker-house-medellin";
const request = (overrides = {}) => ({ tenantId: "tenant-a", metric: "checkins", mode: "aggregate", entityIds: [], start: 0, end: 2000, bucketMs: 1000, ...overrides });
const row = (overrides = {}) => ({ tenantId: "tenant-a", entityId: "user-a", metric: "checkins", unit: "count", at: 0, value: 1, consented: true, ...overrides });
const five = () => Array.from({ length: 5 }, (_, n) => row({ entityId: `user-${n}`, value: n + 1 }));
function setup(rows = five(), changes = {}) {
  const calls = [];
  const dependencies = {
    minEntities: 5,
    authorize: async input => { calls.push(["authorize", input]); return true; },
    read: async input => { calls.push(["read", input]); return rows; },
    audit: async event => { calls.push(["audit", event]); },
    ...changes,
  };
  return { api: createActivityVisualization(dependencies), calls, dependencies };
}
const rejects = async (run, code = "invalid-input") => assert.rejects(run, error =>
  error instanceof ActivityVisualizationError && error.code === code && error.message === "Activity visualization unavailable");

test("binds the exact application and calls the actual Claritas renderer", async () => {
  assert.equal(APPLICATION_SCOPE, scope);
  const { api, calls } = setup();
  const out = await api.report(request());
  assert.equal(out.application, scope);
  assert.equal(out.tenantId, "tenant-a");
  assert.equal(out.series[0].points[0].value, 15); // sum, NOT Claritas's entity mean of 3
  assert.equal(out.series[0].points[0].entities, 5);
  assert.equal(out.series[0].points[1].state, "missing");
  assert.match(out.charts[0], /<svg[^>]+role="img"/);
  assert.match(out.charts[0], /observed total/);
  assert.match(out.charts[0], /0: 15/);
  assert.deepEqual(calls.map(call => call[0]), ["authorize", "read", "authorize", "audit"]);
  assert.equal(calls[0][1].application, scope);
  assert.deepEqual(Object.keys(calls[3][1]), ["application", "tenantId", "metric", "mode"]);
});
test("an explicitly observed zero is not missing", async () => {
  const { api } = setup(five().map(item => ({ ...item, value: 0 })));
  assert.deepEqual((await api.report(request())).series[0].points[0], { at: 0, value: 0, entities: 5, state: "observed" });
});
test("small cells disclose neither values, contributor counts nor IDs", async () => {
  const { api } = setup(five().slice(0, 4));
  const out = await api.report(request());
  assert.deepEqual(out.series[0].points[0], { at: 0, value: null, entities: null, state: "suppressed" });
  assert.doesNotMatch(JSON.stringify(out), /user-0|user-1/);
});
test("null and revoked consent never become synthetic zero activity", async () => {
  for (const rows of [[], five().map(item => ({ ...item, consented: false })), five().map(item => ({ ...item, value: null }))]) {
    const out = await setup(rows).api.report(request());
    assert.equal(out.series[0].points[0].state, "missing");
    assert.equal(out.series[0].points[0].value, null);
  }
});
test("the server release threshold cannot be weakened by a request", async () => {
  assert.equal((await setup(five(), { minEntities: 6 }).api.report(request())).series[0].points[0].state, "suppressed");
  await rejects(() => setup().api.report(request({ minEntities: 1 })));
  assert.throws(() => setup([], { minEntities: 4 }), ActivityVisualizationError);
});
test("two-user comparison exposes a numeric delta and explicit independent scales", async () => {
  const rows = [row({ entityId: "left", value: 20 }), row({ entityId: "right", value: 5 })];
  const out = await setup(rows).api.report(request({ mode: "compare", entityIds: ["left", "right"] }));
  assert.deepEqual(out.comparison, [{ at: 0, left: 20, right: 5, delta: -15 }, { at: 1000, left: null, right: null, delta: null }]);
  assert.equal(out.scale, "independent-use-comparison-table");
  assert.equal(out.charts.length, 2);
  assert.ok(out.charts.every(svg => svg.includes("independent scale")));
});
test("comparison does not infer a delta for an absent participant", async () => {
  const out = await setup([row({ entityId: "left", value: 0 })]).api.report(request({ mode: "compare", entityIds: ["left", "right"] }));
  assert.deepEqual(out.comparison[0], { at: 0, left: 0, right: null, delta: null });
});
test("denied and non-boolean authorization never call the loader", async () => {
  for (const answer of [false, "true", 1, null]) {
    let reads = 0;
    const { api } = setup([], { authorize: async () => answer, read: async () => { reads++; return []; } });
    await rejects(() => api.report(request()), "denied");
    assert.equal(reads, 0);
  }
});
test("revocation after a query blocks release and successful-release audit", async () => {
  let checks = 0, audits = 0;
  const { api } = setup(five(), { authorize: async () => ++checks === 1, audit: async () => { audits++; } });
  await rejects(() => api.report(request()), "denied");
  assert.equal(audits, 0);
});
for (const method of ["authorize", "read", "audit"]) test(`${method} errors disclose no provider details`, async () => {
  const { api } = setup(five(), { [method]: async () => { throw new Error("private-provider-data"); } });
  await rejects(() => api.report(request()), "unavailable");
});
test("request and callback snapshots survive mutation while authorization awaits", async () => {
  let release;
  let checks = 0;
  const gate = new Promise(resolve => { release = resolve; });
  const input = request({ mode: "compare", entityIds: ["left", "right"] });
  const { api, dependencies } = setup([row({ entityId: "left" }), row({ entityId: "right" })], {
    authorize: async captured => { assert.ok(Object.isFrozen(captured.entityIds)); if (++checks === 1) await gate; return true; },
  });
  const pending = api.report(input);
  input.entityIds[0] = "intruder";
  input.tenantId = "tenant-b";
  dependencies.read = async () => { throw new Error("replaced callback must not run"); };
  release();
  assert.deepEqual((await pending).series.map(item => item.id), ["left", "right"]);
});
test("output is deeply immutable and input-order deterministic", async () => {
  const a = await setup(five()).api.report(request());
  const b = await setup(five().reverse()).api.report(request());
  assert.deepEqual(a, b);
  assert.ok(Object.isFrozen(a) && Object.isFrozen(a.series) && Object.isFrozen(a.series[0].points[0]));
});
test("no implicit fetch or telemetry is introduced", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("unexpected network"); };
  try { await setup().api.report(request()); } finally { globalThis.fetch = original; }
});
test("whole-second consented activity is bounded by the actual final bucket duration", async () => {
  const rows = five().map(item => ({ ...item, metric: "activeSeconds", unit: "seconds", value: 1 }));
  const out = await setup(rows).api.report(request({ metric: "activeSeconds" }));
  assert.equal(out.unit, "seconds");
  assert.equal(out.series[0].points[0].value, 5);
  await rejects(() => setup(rows).api.report(request({ metric: "activeSeconds", end: 500 })));
});
test("contribution reports contain observations, not scores or eligibility decisions", async () => {
  const out = await setup(five().map(item => ({ ...item, metric: "contributions" }))).api.report(request({ metric: "contributions" }));
  assert.doesNotMatch(JSON.stringify(out), /eligibility|ranking|socialScore|creditScore/);
  assert.equal(out.metric, "contributions");
});
for (const change of [
  { tenantId: "tenant-b" }, { entityId: "bad\n" }, { entityId: "bad\u202e" },
  { entityId: "<script>" }, { metric: "activeSeconds" }, { unit: "seconds" },
  { consented: "true" }, { at: 1 }, { at: 2000 }, { at: -1 },
  { value: NaN }, { value: Infinity }, { value: -1 }, { value: 0.5 }, { value: 1e9 + 1 },
  { rawLocation: "private" },
]) test(`rejects malformed, cross-tenant or unapproved measurement ${JSON.stringify(change)}`, async () => {
  await rejects(() => setup([row(change)]).api.report(request()));
});
test("duplicate entity/bucket measurements fail rather than inflate or average replayed values", async () => {
  await rejects(() => setup([row(), row()]).api.report(request()));
});
test("comparison refuses unrequested data and self-comparison", async () => {
  await rejects(() => setup([row({ entityId: "other" })]).api.report(request({ mode: "compare", entityIds: ["left", "right"] })));
  await rejects(() => setup().api.report(request({ mode: "compare", entityIds: ["left", "left"] })));
});
for (const change of [{ metric: "__proto__" }, { metric: "socialScore" }, { tenantId: "x\n" }, { end: 0 }, { end: 1001000 }, { bucketMs: 0 }, { entityIds: ["subset"] }, { mode: "rank" }]) {
  test(`rejects invalid request before authorization ${JSON.stringify(change)}`, async () => {
    let authorized = false;
    const { api } = setup([], { authorize: async () => { authorized = true; return true; } });
    await rejects(() => api.report(request(change)));
    assert.equal(authorized, false);
  });
}
test("oversized inputs fail closed", async () => {
  await rejects(() => setup(Array(50001).fill(row())).api.report(request()));
});

test("sparse comparison selectors cannot bypass identifier validation", async () => {
  const ids = new Array(2); ids[1] = "right";
  await rejects(() => setup().api.report(request({ mode: "compare", entityIds: ids })));
});
