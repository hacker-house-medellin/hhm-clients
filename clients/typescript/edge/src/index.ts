export type ClientOptions = { baseUrl: string; token?: string; fetchImpl?: typeof fetch };

export class HackerHouseMedellinClient {
  readonly baseUrl: string;
  readonly token?: string;
  readonly fetchImpl: typeof fetch;

  constructor(options: ClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.token = options.token;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (this.token && !headers.has("authorization")) headers.set("authorization", `Bearer ${this.token}`);
    const response = await this.fetchImpl(`${this.baseUrl}/${path.replace(/^\/+/, "")}`, { ...init, headers });
    if (!response.ok) throw new Error(`Hacker House Medellín request failed: ${response.status}`);
    return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
  }
}
