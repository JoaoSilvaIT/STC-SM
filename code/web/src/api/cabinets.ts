import { idFromHref, parseLocationId, request, requestWithHeaders } from './client'
import type { Cabinet, CabinetStatus } from '@/types/domain'

type BeCabinetStatus = 'OPEN' | 'CLOSED' | 'BROKEN' | 'INACTIVE'

interface CabinetResponse {
  description: string
  status: BeCabinetStatus
  location: string
  self: string
}

const STATUS_FROM_BE: Record<BeCabinetStatus, CabinetStatus> = {
  OPEN: 'ONLINE',
  CLOSED: 'ONLINE',
  BROKEN: 'OFFLINE',
  INACTIVE: 'MAINTENANCE',
}

const STATUS_TO_BE: Record<CabinetStatus, BeCabinetStatus> = {
  ONLINE: 'OPEN',
  OFFLINE: 'BROKEN',
  MAINTENANCE: 'INACTIVE',
}

function toDomain(raw: CabinetResponse, fallbackId = 0): Cabinet {
  return {
    id: idFromHref(raw.self) || fallbackId,
    name: raw.description,
    location: raw.location,
    status: STATUS_FROM_BE[raw.status],
    isActive: raw.status !== 'INACTIVE',
    activeShiftId: null,
  }
}

export async function listCabinets(): Promise<Cabinet[]> {
  const raw = await request<CabinetResponse[]>('/api/cabinets', { auth: true })
  return raw.map(r => toDomain(r))
}

export async function getCabinet(id: number): Promise<Cabinet> {
  const raw = await request<CabinetResponse>(`/api/cabinets/${id}`, { auth: true })
  return toDomain(raw, id)
}

export async function createCabinet(input: { name: string; location: string; status: CabinetStatus }): Promise<Cabinet> {
  const { body, headers } = await requestWithHeaders<CabinetResponse>('/api/cabinets', {
    method: 'POST',
    body: {
      description: input.name,
      location: input.location,
      status: STATUS_TO_BE[input.status],
    },
    auth: true,
  })
  return toDomain(body, parseLocationId(headers) ?? 0)
}

export async function updateCabinet(id: number, status: CabinetStatus): Promise<Cabinet> {
  const raw = await request<CabinetResponse>(`/api/cabinets/${id}`, {
    method: 'PUT',
    body: { status: STATUS_TO_BE[status] },
    auth: true,
  })
  return toDomain(raw, id)
}
