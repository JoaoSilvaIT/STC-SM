import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

function getApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // If running in Expo Go over LAN, dynamically get the computer's IP
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:8080`;
  }

  // Fallback for Emulators / Web
  return Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
}

export const BASE_URL = getApiUrl();

const TOKEN_KEY = 'stc_token';

// In-memory cache of the access token. SecureStore is async, so this keeps request() synchronous.
let _token: string | null = null;

// Ensures concurrent 401s trigger a single refresh instead of a stampede.
let refreshPromise: Promise<string | null> | null = null;

export function getToken(): string | null {
  return _token;
}

export async function setToken(token: string | null): Promise<void> {
  _token = token;
  try {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // SecureStore is unavailable on web; the in-memory token still works for this session.
  }
}

// Restores a persisted session on app startup. Returns the stored token, if any.
export async function loadToken(): Promise<string | null> {
  try {
    _token = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    _token = null;
  }
  return _token;
}

export class ApiError extends Error {
  status: number;
  problem: unknown;
  constructor(status: number, message: string, problem: unknown = undefined) {
    super(message);
    this.status = status;
    this.problem = problem;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  _isRetry?: boolean;
}

async function refreshSession(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/users/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        await setToken(null);
        return null;
      }
      const data = await res.json();
      await setToken(data.token);
      return data.token as string;
    } catch {
      await setToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    credentials: 'include',
  });

  // Access token expired: refresh once and replay the original request.
  if (res.status === 401 && opts.auth && !opts._isRetry) {
    const newToken = await refreshSession();
    if (newToken) {
      return request<T>(path, { ...opts, _isRetry: true });
    }
  }

  const text = res.status === 204 ? '' : await res.text();
  const data = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const msg =
      data && typeof data === 'object' && 'title' in (data as object)
        ? String((data as Record<string, unknown>).title)
        : `HTTP ${res.status}`;
    throw new ApiError(res.status, msg, data);
  }

  return data as T;
}

export function idFromHref(href: string | null | undefined): number {
  if (!href) return 0;
  const n = Number(href.split('/').pop());
  return Number.isFinite(n) ? n : 0;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
