import { idFromHref, request } from './client'
import type { User, UserRole, UserStatus } from '@/types/domain'

interface LoginResponse {
  token: string
}

interface MeResponse {
  name: string
  email: string
  role: string
  status: string
  self: string
}

export async function login(email: string, password: string): Promise<{ token: string }> {
  const res = await request<LoginResponse>('/api/users/login', {
    method: 'POST',
    body: { username: email, password },
  })
  return { token: res.token }
}

export function logout(): Promise<void> {
  return request<void>('/api/users/logout', {
    method: 'POST',
    auth: true,
  })
}

export function refresh(): Promise<{ token: string }> {
  return request<LoginResponse>('/api/users/refresh', {
    method: 'POST',
  })
}

export async function me(): Promise<User> {
  const raw = await request<MeResponse>('/api/users/me', { auth: true })
  return {
    id: idFromHref(raw.self),
    name: raw.name,
    email: raw.email,
    role: raw.role as UserRole,
    isActive: (raw.status as UserStatus) === 'ACTIVE',
  }
}
