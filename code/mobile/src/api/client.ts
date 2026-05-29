import { Platform } from 'react-native';

// Android emulator can't reach host's localhost; iOS simulator can
export const BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

let _token: string | null = null;

export function getToken(): string | null {
  return _token;
}

export function setToken(token: string | null) {
  _token = token;
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
