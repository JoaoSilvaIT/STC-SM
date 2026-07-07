import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  getToken,
  idFromHref,
  parseLocationId,
  request,
  requestWithHeaders,
  setToken,
} from './client'

const BASE = 'http://localhost:8080'

/** Build a real Response so client.ts sees genuine .ok / .status / .text(). */
function jsonResponse(body: unknown, init: ResponseInit = {}) {
  const isBodyless = init.status === 204
  return new Response(isBodyless ? null : JSON.stringify(body), {
    status: init.status ?? 200,
    headers: init.headers ?? { 'Content-Type': 'application/json' },
  })
}

describe('idFromHref', () => {
  it('extracts the trailing numeric id from an href', () => {
    expect(idFromHref('/api/tools/42')).toBe(42)
  })

  it('returns 0 for null, undefined or empty input', () => {
    expect(idFromHref(null)).toBe(0)
    expect(idFromHref(undefined)).toBe(0)
    expect(idFromHref('')).toBe(0)
  })

  it('returns 0 when the last segment is not a number', () => {
    expect(idFromHref('/api/tools/abc')).toBe(0)
  })
})

describe('parseLocationId', () => {
  it('reads the id out of the Location header', () => {
    const headers = new Headers({ Location: '/api/cabinets/7' })
    expect(parseLocationId(headers)).toBe(7)
  })

  it('returns null when there is no Location header', () => {
    expect(parseLocationId(new Headers())).toBeNull()
  })
})

describe('token storage', () => {
  beforeEach(() => localStorage.clear())

  it('persists and reads back the token', () => {
    expect(getToken()).toBeNull()
    setToken('abc123')
    expect(getToken()).toBe('abc123')
    expect(localStorage.getItem('stc_token')).toBe('abc123')
  })

  it('removes the token when set to null', () => {
    setToken('abc123')
    setToken(null)
    expect(getToken()).toBeNull()
  })
})

describe('request', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('returns the parsed body on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ hello: 'world' })))
    await expect(request('/api/ping')).resolves.toEqual({ hello: 'world' })
  })

  it('returns undefined for a 204 No Content response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(null, { status: 204 })))
    await expect(request('/api/logout', { method: 'POST' })).resolves.toBeUndefined()
  })

  it('serialises the body and sets a JSON content-type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    await request('/api/things', { method: 'POST', body: { a: 1 } })

    const [, opts] = fetchMock.mock.calls[0]
    expect(opts.method).toBe('POST')
    expect(opts.body).toBe(JSON.stringify({ a: 1 }))
    expect(opts.headers['Content-Type']).toBe('application/json')
  })

  it('attaches a bearer token when auth is requested', async () => {
    setToken('tok-1')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}))
    vi.stubGlobal('fetch', fetchMock)

    await request('/api/secure', { auth: true })

    const [, opts] = fetchMock.mock.calls[0]
    expect(opts.headers['Authorization']).toBe('Bearer tok-1')
  })

  it('does not attach a token when auth is not requested', async () => {
    setToken('tok-1')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}))
    vi.stubGlobal('fetch', fetchMock)

    await request('/api/public')

    const [, opts] = fetchMock.mock.calls[0]
    expect(opts.headers['Authorization']).toBeUndefined()
  })

  it('throws an ApiError carrying the problem title', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ title: 'Bad thing' }, { status: 400 })),
    )

    await expect(request('/api/thing')).rejects.toMatchObject({
      name: 'Error',
      status: 400,
      message: 'Bad thing',
    })
    await expect(request('/api/thing')).rejects.toBeInstanceOf(ApiError)
  })

  it('falls back to "HTTP <status>" when the error has no title', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, { status: 500 })))
    await expect(request('/api/thing')).rejects.toMatchObject({
      status: 500,
      message: 'HTTP 500',
    })
  })

  it('exposes response headers via requestWithHeaders', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({}, { status: 201, headers: { Location: '/api/tools/9' } }),
      ),
    )

    const { headers, status } = await requestWithHeaders('/api/tools', { method: 'POST' })
    expect(status).toBe(201)
    expect(parseLocationId(headers)).toBe(9)
  })
})

describe('request — 401 refresh flow', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('refreshes the session and retries the original request on 401', async () => {
    setToken('stale')
    const fetchMock = vi
      .fn()
      // 1) original request rejected
      .mockResolvedValueOnce(jsonResponse({ title: 'Unauthorized' }, { status: 401 }))
      // 2) refresh call succeeds with a new token
      .mockResolvedValueOnce(jsonResponse({ token: 'fresh' }))
      // 3) retried request succeeds
      .mockResolvedValueOnce(jsonResponse({ data: 'ok' }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(request('/api/secure', { auth: true })).resolves.toEqual({ data: 'ok' })

    // Refresh endpoint was hit and the new token got persisted.
    expect(fetchMock.mock.calls[1][0]).toBe(`${BASE}/api/users/refresh`)
    expect(getToken()).toBe('fresh')

    // Retry carried the refreshed bearer token.
    const [, retryOpts] = fetchMock.mock.calls[2]
    expect(retryOpts.headers['Authorization']).toBe('Bearer fresh')
  })

  it('clears the token and redirects to /login when refresh fails', async () => {
    setToken('stale')
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, { status: 401 }))
      // refresh rejected
      .mockResolvedValueOnce(jsonResponse({}, { status: 401 }))
    vi.stubGlobal('fetch', fetchMock)

    // window.location is read-only in jsdom; swap in a writable stub.
    const original = window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...original, href: '' },
    })

    // The failed-refresh path lets the (now bodyless) response fall through, so
    // the promise still settles; we only care about the side effects.
    await request('/api/secure', { auth: true }).catch(() => {})

    expect(getToken()).toBeNull()
    expect(window.location.href).toBe('/login')

    Object.defineProperty(window, 'location', { configurable: true, value: original })
  })
})
