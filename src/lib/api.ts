import { useAuthStore, type AuthUser } from "@/stores/auth";

export const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    "VITE_API_URL is not set. Copy .env.example to .env and fill it in.",
  );
}

// Dev: relative /api goes through the Vite proxy. Prod: call the backend directly.
const BASE_URL = import.meta.env.DEV
  ? "/api"
  : `${API_URL.replace(/\/$/, "")}/api`;

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String(data.message)
        : `API error ${status}`;
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getToken(): string | null {
  return useAuthStore.getState().accessToken;
}

// Request interceptor: runs before every request.
function onRequest(headers: Headers) {
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
}

// Response interceptor: runs after every response.
async function onResponse(res: Response) {
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body);
  // The backend wraps every response as { message, data }; callers only need data.
  return body?.data ?? body;
}

// TODO: match to the backend's refresh/sign-up response.
type TokenResponse = { token: string; user?: AuthUser };

let refreshing: Promise<boolean> | null = null;

// Gets a new access token using the refresh-token cookie. Concurrent callers share one request.
export function refreshAccessToken(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("error getting refresh tokens");
      const data = (await res.json())?.data as TokenResponse;
      useAuthStore.getState().setAuth(data.token, data.user);
      return true;
    } catch {
      useAuthStore.getState().clearAuth();
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

async function send(path: string, init: RequestInit) {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  onRequest(headers);

  // credentials: "include" so the browser stores and sends the refresh-token cookie.
  return fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res = await send(path, init);

  // Access token expired: refresh once and retry. Auth routes are skipped to avoid loops.
  if (
    res.status === 401 &&
    !path.startsWith("/auth/") &&
    (await refreshAccessToken())
  ) {
    res = await send(path, init);
  }

  return (await onResponse(res)) as T;
}

export const api = {
  get: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
};
