export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export interface ClientOptions {
  baseUrl: string;
  token?: string;
  fetchImpl?: FetchLike;
}

export class ClientError extends Error {
  constructor(public readonly status: number, public readonly responseBody: string) {
    super(`HTTP ${status}: ${responseBody}`);
    this.name = "ClientError";
  }
}

export class Client {
  readonly baseUrl: string;
  readonly token?: string;
  readonly fetchImpl: FetchLike;

  constructor(options: ClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.token = options.token;
    const fetchImpl = options.fetchImpl ?? globalThis.fetch?.bind(globalThis);
    if (!fetchImpl) throw new Error("A Fetch API implementation is required");
    this.fetchImpl = fetchImpl;
  }

  health(): Promise<unknown> { return this.request("GET", "/healthz"); }
  getConfig(): Promise<unknown> { return this.request("GET", "/api/config"); }
  emitEvent(payload: unknown): Promise<unknown> { return this.request("POST", "/api/events", payload); }
  emitAlert(payload: unknown): Promise<unknown> { return this.request("POST", "/api/alerts", payload); }

  async request(method: string, path: string, payload?: unknown): Promise<unknown> {
    const headers = new Headers({ accept: "application/json" });
    if (this.token) headers.set("authorization", `Bearer ${this.token}`);
    let body: string | undefined;
    if (payload !== undefined) {
      headers.set("content-type", "application/json");
      body = JSON.stringify(payload);
    }
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, { method, headers, body });
    const text = await response.text();
    if (!response.ok) throw new ClientError(response.status, text);
    if (!text) return undefined;
    const contentType = response.headers.get("content-type") ?? "";
    return contentType.includes("json") ? JSON.parse(text) : text;
  }
}
