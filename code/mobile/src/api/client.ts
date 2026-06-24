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

const TOKEN_KEY = 'stc_sm_auth_token';

// In-memory copy so request() can read the token synchronously. The persisted
// copy in SecureStore survives app restarts and is loaded once on startup.
let _token: string | null = null;

const secureStoreAvailable = Platform.OS !== 'web';

export function getToken(): string | null {
  return _token;
}

export function setToken(token: string | null) {
  _token = token;
  // Persist in the background — request() relies on the in-memory copy above.
  if (!secureStoreAvailable) return;
  if (token) {
    SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => { /* best-effort */ });
  } else {
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => { /* best-effort */ });
  }
}

/** Load any persisted token into memory. Call once on app startup. */
export async function loadToken(): Promise<string | null> {
  if (!secureStoreAvailable) return _token;
  try {
    _token = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    _token = null;
  }
  return _token;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
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

  const text = res.status === 204 ? '' : await res.text();
  const data = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const msg =
      data && typeof data === 'object' && 'title' in (data as object)
        ? String((data as Record<string, unknown>).title)
        : `HTTP ${res.status}`;
    throw new ApiError(res.status, msg);
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
