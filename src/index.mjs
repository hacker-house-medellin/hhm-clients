export const product = Object.freeze({
  org: "hacker-house-medellin",
  name: "Hacker House Medellín",
  slug: "hacker-house-medellin",
  audience: "founders, engineers, creators, remote operators, builders visiting Medellín, and local community hosts",
  capabilities: ['health', 'config', 'events', 'leads', 'alerts'],
});

export class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export class ServiceClient {
  constructor({ baseUrl, token, fetchImpl = globalThis.fetch } = {}) {
    if (typeof baseUrl !== 'string' || !baseUrl.trim()) throw new TypeError('baseUrl is required');
    if (typeof fetchImpl !== 'function') throw new TypeError('fetch implementation is required');
    let endpoint;
    try {
      endpoint = new URL(baseUrl);
    } catch {
      throw new TypeError('baseUrl must be an absolute HTTP(S) URL');
    }
    if (!['http:', 'https:'].includes(endpoint.protocol) || !endpoint.hostname
      || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
      throw new TypeError('baseUrl must be an absolute HTTP(S) URL without credentials, query or fragment');
    }
    this.baseUrl = endpoint.toString().replace(/\/+$/, '');
    this.token = token;
    this.fetch = fetchImpl;
  }
  health() { return this.request('/healthz'); }
  ready() { return this.request('/readyz'); }
  config() { return this.request('/api/config'); }
  emitEvent(payload) { return this.request('/api/events', { method: 'POST', body: payload }); }
  createLead(payload) { return this.request('/api/leads', { method: 'POST', body: payload }); }
  createAlert(payload) { return this.request('/api/alerts', { method: 'POST', body: payload }); }
  async request(path, { method = 'GET', headers = {}, body } = {}) {
    const requestHeaders = new Headers(headers);
    requestHeaders.set('accept', 'application/json');
    if (this.token) requestHeaders.set('authorization', `Bearer ${this.token}`);
    const init = { method, headers: requestHeaders };
    if (body !== undefined) {
      requestHeaders.set('content-type', 'application/json');
      init.body = JSON.stringify(body);
    }
    const res = await this.fetch(`${this.baseUrl}${path}`, init);
    const text = await res.text();
    let parsed = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch (error) {
        if (res.ok) throw error;
        parsed = text;
      }
    }
    if (!res.ok) throw new ApiError(`Request failed: ${res.status}`, { status: res.status, body: parsed });
    return parsed;
  }
}

export function createClient(config) { return new ServiceClient(config); }
