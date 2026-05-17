const BASE_URL = (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://localhost:8080'

const TOKEN_KEY = 'stc_token'

export class ApiError extends Error {
  status: number
  problem: unknown
  constructor(status: number, message: string, problem: unknown) {
    super(message)
    this.status = status
    this.problem = problem
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
  credentials?: RequestCredentials
}

interface RawResponse<T> {
  body: T
  headers: Headers
  status: number
}

async function send<T>(path: string, opts: RequestOptions): Promise<RawResponse<T>> {
  const headers: Record<string, string> = {}
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'

  if (opts.auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    credentials: opts.credentials ?? 'include',
  })

  const text = res.status === 204 ? '' : await res.text()
  const data = text ? safeJson(text) : undefined

  if (!res.ok) {
    const title =
      (data && typeof data === 'object' && 'title' in data && typeof (data as { title: unknown }).title === 'string')
        ? (data as { title: string }).title
        : `HTTP ${res.status}`
    throw new ApiError(res.status, title, data)
  }

  return { body: data as T, headers: res.headers, status: res.status }
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body } = await send<T>(path, opts)
  return body
}

export async function requestWithHeaders<T>(path: string, opts: RequestOptions = {}): Promise<RawResponse<T>> {
  return send<T>(path, opts)
}

function safeJson(text: string): unknown {
  try { return JSON.parse(text) } catch { return text }
}

export function parseLocationId(headers: Headers): number | null {
  const loc = headers.get('Location')
  return loc ? idFromHref(loc) : null
}

export function idFromHref(href: string | null | undefined): number {
  if (!href) return 0
  const n = Number(href.split('/').pop())
  return Number.isFinite(n) ? n : 0
}
