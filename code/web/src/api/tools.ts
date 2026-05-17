import { idFromHref, parseLocationId, request, requestWithHeaders } from './client'
import type { Tool, ToolStatus } from '@/types/domain'

type BeToolStatus = 'ACTIVE' | 'BROKEN' | 'REPAIRING'

const STATUS_TO_BE: Record<ToolStatus, BeToolStatus> = {
  AVAILABLE: 'ACTIVE',
  IN_USE: 'ACTIVE',
  MISSING: 'BROKEN',
  MAINTENANCE: 'REPAIRING',
}

interface ToolResponse {
  name: string
  partNumber: string
  status: ToolStatus
  isActive: boolean
  self: string
  cabinet: string
}

function toDomain(raw: ToolResponse, fallbackId = 0): Tool {
  return {
    id: idFromHref(raw.self) || fallbackId,
    name: raw.name,
    partNumber: raw.partNumber,
    cabinetId: idFromHref(raw.cabinet),
    status: raw.status,
    isActive: raw.isActive,
  }
}

export async function listTools(): Promise<Tool[]> {
  const raw = await request<ToolResponse[]>('/api/tools', { auth: true })
  return raw.map(r => toDomain(r))
}

export async function getTool(id: number): Promise<Tool> {
  const raw = await request<ToolResponse>(`/api/tools/${id}`, { auth: true })
  return toDomain(raw, id)
}

export async function createTool(input: {
  name: string
  cabinetId: number
  status: ToolStatus
  location: string
}): Promise<Tool> {
  const { body, headers } = await requestWithHeaders<ToolResponse>('/api/tools', {
    method: 'POST',
    body: {
      name: input.name,
      cabinetId: input.cabinetId,
      status: STATUS_TO_BE[input.status],
      location: input.location,
    },
    auth: true,
  })
  return toDomain(body, parseLocationId(headers) ?? 0)
}

export async function updateTool(id: number, status: ToolStatus): Promise<Tool> {
  const raw = await request<ToolResponse>(`/api/tools/${id}`, {
    method: 'PUT',
    body: { status: STATUS_TO_BE[status] },
    auth: true,
  })
  return toDomain(raw, id)
}
