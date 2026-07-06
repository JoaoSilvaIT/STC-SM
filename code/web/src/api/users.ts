import { idFromHref, parseLocationId, request, requestWithHeaders } from './client'
import type { User, UserRole, UserStatus } from '@/types/domain'

const ROLE_TO_PROFILE: Record<UserRole, number> = {
  MECHANIC: 1,
  BACK_OFFICE: 2,
  ADMIN: 3,
}

interface UserResponse {
  name: string
  email: string
  role: UserRole
  status: UserStatus
  self: string
}

function toDomain(raw: UserResponse, fallbackId = 0): User {
  return {
    id: idFromHref(raw.self) || fallbackId,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    isActive: raw.status === 'ACTIVE',
  }
}

export async function listUsers(): Promise<User[]> {
  const raw = await request<UserResponse[]>('/api/users', { auth: true })
  return raw.map(r => toDomain(r))
}

// Mechanics that are not yet the owner of any shift — used by back-office to assign new shifts.
export async function listUnassignedMechanics(): Promise<User[]> {
  const raw = await request<UserResponse[]>('/api/shifts/unassigned-mechanics', { auth: true })
  return raw.map(r => toDomain(r))
}

export async function createUser(input: {
  name: string
  email: string
  password: string
  role: UserRole
}): Promise<User> {
  const { body, headers } = await requestWithHeaders<UserResponse>('/api/users', {
    method: 'POST',
    body: {
      name: input.name,
      email: input.email,
      password: input.password,
      profile: ROLE_TO_PROFILE[input.role],
    },
    auth: true,
  })
  return toDomain(body, parseLocationId(headers) ?? 0)
}

export async function updateUserState(id: number, state: UserStatus): Promise<User> {
  const raw = await request<UserResponse>(`/api/users/${id}`, {
    method: 'PUT',
    body: { state },
    auth: true,
  })
  return toDomain(raw, id)
}
