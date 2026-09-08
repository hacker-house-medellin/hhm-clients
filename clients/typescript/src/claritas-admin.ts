import { createVisualizationSdk, type Observation, type TrendSeries } from "@claritas-viz/claritas-pub-lib-core";

/** Server-side integration helpers, NOT a new HTTP contract or an auth implementation.
 * Bind the callbacks to a verified request principal. Never send raw rows to a browser.
 */
export const APPLICATION_SCOPE = "hacker-house-medellin";
const METRICS = Object.freeze({
  checkins: { unit: "count", label: "Check-ins" },
  activeSeconds: { unit: "seconds", label: "Consented app activity" },
  contributions: { unit: "count", label: "Recorded community contributions" },
} as const);
export type ActivityMetric = keyof typeof METRICS;
export interface ActivityRequest {
  readonly tenantId: string;
  readonly metric: ActivityMetric;
  readonly mode: "aggregate" | "compare";
  readonly entityIds: readonly string[];
  readonly start: number;
  readonly end: number;
  readonly bucketMs: number;
}
/** One authoritative measurement per entity/bucket; not a stream of raw events. */
export interface ActivityMeasurement {
  readonly tenantId: string;
  readonly entityId: string;
  readonly metric: ActivityMetric;
  readonly unit: "count" | "seconds";
  readonly at: number;
  readonly value: number | null;
  readonly consented: boolean;
}
export interface ActivityAccess extends ActivityRequest { readonly application: typeof APPLICATION_SCOPE }
export interface ActivityDependencies {
  /** Must enforce membership, admin role, purpose, individual-view permission and query budget. */
  readonly authorize: (request: ActivityAccess) => Promise<boolean>;
  /** Must query only this tenant and recheck current consent/retention in authoritative storage. */
  readonly read: (request: ActivityAccess) => Promise<readonly ActivityMeasurement[]>;
  /** Persist a successful release audit; rejection/transport failure prevents release. */
  readonly audit: (event: Readonly<{ application: string; tenantId: string; metric: ActivityMetric; mode: ActivityRequest["mode"] }>) => Promise<void>;
  /** Explicit approved server policy. Five is a safety floor, not proof of anonymization. */
  readonly minEntities: number;
}
export class ActivityVisualizationError extends Error {
  readonly code: "invalid-input" | "denied" | "unavailable";
  constructor(code: "invalid-input" | "denied" | "unavailable") {
    super("Activity visualization unavailable");
    this.name = "ActivityVisualizationError";
    this.code = ["invalid-input", "denied", "unavailable"].includes(code) ? code : "unavailable";
  }
}
const invalid = (): never => { throw new ActivityVisualizationError("invalid-input"); };
const id = (value: unknown): value is string => typeof value === "string" && value.length > 0 && value.length <= 64 && /^[A-Za-z0-9]/.test(value) && !/[^A-Za-z0-9_-]/.test(value);
const integer = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= 1e15;
const closed = (value: unknown, keys: readonly string[]): boolean => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const own = Object.keys(value);
  return own.length === keys.length && own.every(key => keys.includes(key));
};
const freezeSeries = (series: TrendSeries): TrendSeries => Object.freeze({
  id: series.id, points: Object.freeze(series.points.map(point => Object.freeze({ ...point }))),
});
function snapshot(input: ActivityRequest): ActivityAccess {
  if (!closed(input, ["tenantId", "metric", "mode", "entityIds", "start", "end", "bucketMs"])) invalid();
  const { tenantId, metric, mode, entityIds, start, end, bucketMs } = input;
  if (!id(tenantId) || typeof metric !== "string" || !Object.hasOwn(METRICS, metric) || !["aggregate", "compare"].includes(mode) ||
      !Array.isArray(entityIds) || ![start, end, bucketMs].every(integer) || start >= end || bucketMs < 1 ||
      Math.ceil((end - start) / bucketMs) > 1000) invalid();
  if (mode === "aggregate" ? entityIds.length !== 0 :
      entityIds.length !== 2 || !id(entityIds[0]) || !id(entityIds[1]) || entityIds[0] === entityIds[1]) invalid();
  return Object.freeze({ application: APPLICATION_SCOPE, tenantId, metric, mode,
    entityIds: Object.freeze([...entityIds]), start, end, bucketMs });
}

/** Calls the actual Claritas package; no algorithm copy, implicit transport or demo fallback.
 * No score, ranking, location inference, eligibility or access-control decision is produced.
 */
export function createActivityVisualization(dependencies: ActivityDependencies) {
  if (!dependencies) invalid();
  const { authorize, read, audit, minEntities } = dependencies;
  if (![authorize, read, audit].every(callback => typeof callback === "function") ||
      !Number.isInteger(minEntities) || minEntities < 5 || minEntities > 10000) invalid();
  const viz = createVisualizationSdk();
  return Object.freeze({
    async report(input: ActivityRequest) {
      try {
        const request = snapshot(input);
        if (await authorize(request) !== true) throw new ActivityVisualizationError("denied");
        const measurements = await read(request);
        if (!Array.isArray(measurements) || measurements.length > 50000) invalid();
        const rows: Observation[] = [];
        const totals = new Map<number, number>();
        const seen = new Set<string>();
        const metric = METRICS[request.metric];
        for (const measurement of measurements) {
          if (!closed(measurement, ["tenantId", "entityId", "metric", "unit", "at", "value", "consented"])) invalid();
          const { tenantId, entityId, at, value, consented } = measurement;
          if (tenantId !== request.tenantId || !id(entityId) || measurement.metric !== request.metric ||
              measurement.unit !== metric.unit || typeof consented !== "boolean" || !integer(at) ||
              at < request.start || at >= request.end || (at - request.start) % request.bucketMs !== 0 ||
              !(value === null || (integer(value) && value <= 1e9)) ||
              (request.metric === "activeSeconds" && value !== null && value > Math.floor((Math.min(at + request.bucketMs, request.end) - at) / 1000)) ||
              (request.mode === "compare" && !request.entityIds.includes(entityId))) invalid();
          const key = `${entityId}:${at}`;
          if (seen.has(key)) invalid();
          seen.add(key);
          if (!consented) continue;
          rows.push({ entityId, cohortId: "organization", at, value });
          if (value !== null) totals.set(at, (totals.get(at) ?? 0) + value);
        }
        let series: TrendSeries[];
        if (request.mode === "aggregate") {
          const cohort = viz.cohortTrends(rows, { ...request, minEntities })[0];
          // Do not turn absence into a fake zero or reveal contributor IDs.
          const empty = { id: "organization", points: Array.from({ length: Math.ceil((request.end - request.start) / request.bucketMs) }, (_, n) => ({
            at: request.start + n * request.bucketMs, value: null, entities: null, state: "missing" as const,
          })) };
          series = [{ ...(cohort ?? empty), points: (cohort ?? empty).points.map(point => ({
            ...point, value: point.state === "observed" ? totals.get(point.at)! : null,
          })) }];
        } else {
          series = request.entityIds.map(entity => viz.individualTrend(rows, entity, request));
        }
        const frozen = Object.freeze(series.map(freezeSeries));
        const comparison = request.mode === "compare" ? Object.freeze(frozen[0].points.map((left, n) => {
          const right = frozen[1].points[n];
          return Object.freeze({ at: left.at, left: left.value, right: right.value,
            delta: left.value === null || right.value === null ? null : right.value - left.value });
        })) : null;
        const charts = Object.freeze(frozen.map((item, index) => viz.trendSvg(item,
          `${metric.label} (${metric.unit}); ${request.mode === "aggregate" ? "observed total" : `${index === 0 ? "left" : "right"}; independent scale`}`)));
        // Recheck live access after loading; the host owns atomic revocation/query-budget semantics.
        if (await authorize(request) !== true) throw new ActivityVisualizationError("denied");
        await audit(Object.freeze({ application: APPLICATION_SCOPE, tenantId: request.tenantId, metric: request.metric, mode: request.mode }));
        return Object.freeze({ application: APPLICATION_SCOPE, tenantId: request.tenantId, metric: request.metric, unit: metric.unit,
          start: request.start, end: request.end, bucketMs: request.bucketMs,
          semantics: "observed-entity-bucket-totals" as const,
          scale: request.mode === "compare" ? "independent-use-comparison-table" as const : "single-series" as const,
          series: frozen, comparison, charts });
      } catch (error) {
        if (error instanceof ActivityVisualizationError) throw error;
        // Never leak provider errors, private row values, tokens or raw metadata through errors.
        throw new ActivityVisualizationError("unavailable");
      }
    },
  });
}
