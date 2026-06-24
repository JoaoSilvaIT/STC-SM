import { idFromHref, request, setToken } from './client';
import type { User, UserRole } from '../types/domain';

interface LoginResponse {
  token: string;
}

interface MeResponse {
  name: string;
  email: string;
  role: string;
  status: string;
  self: string;
}

export async function login(email: string, password: string): Promise<void> {
  const res = await request<LoginResponse>('/api/users/login', {
    method: 'POST',
    body: { username: email, password },
  });
  await setToken(res.token);
}

export async function me(): Promise<User> {
  const raw = await request<MeResponse>('/api/users/me', { auth: true });
  return {
    id: idFromHref(raw.self),
    name: raw.name,
    email: raw.email,
    role: raw.role as UserRole,
    isActive: raw.status === 'ACTIVE',
  };
}

export function clearToken(): void {
  void setToken(null);
}
