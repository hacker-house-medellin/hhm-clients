export declare class ApiError extends Error { readonly status?: number; readonly body?: unknown; constructor(message: string, options?: {status?: number; body?: unknown}); }
export interface ClientOptions { baseUrl: string; token?: string; fetchImpl?: typeof fetch; }
export declare class ServiceClient {
  constructor(options: ClientOptions);
  health(): Promise<unknown>; ready(): Promise<unknown>; config(): Promise<unknown>;
  emitEvent(payload: unknown): Promise<unknown>; createLead(payload: unknown): Promise<unknown>; createAlert(payload: unknown): Promise<unknown>;
  request(path: string, options?: {method?: string; headers?: HeadersInit; body?: unknown}): Promise<unknown>;
}
export declare function createClient(options: ClientOptions): ServiceClient;
