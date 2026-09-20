const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ApiError {
  detail: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });

    if (!res.ok) {
      const err: ApiError = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Request failed: ${res.status}`);
    }
    // 204 No Content
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  get<T>(path: string) {
    return this.request<T>(path, { method: "GET" });
  }
  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: "POST", body: JSON.stringify(body) });
  }
  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
  }
  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
