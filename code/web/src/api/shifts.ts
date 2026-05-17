import { idFromHref, parseLocationId, request, requestWithHeaders } from './client'
import type { Shift, ShiftStatus } from '@/types/domain'

interface ShiftResponse {
  userName: string
  cabinetDescription: string
  startTime: string
  endTime: string
  status: ShiftStatus
  self: string
  user: string
  cabinet: string
}

function toDomain(raw: ShiftResponse, fallbackId = 0): Shift {
  return {
    id: idFromHref(raw.self) || fallbackId,
    userId: idFromHref(raw.user),
    userName: raw.userName,
    cabinetId: idFromHref(raw.cabinet),
    cabinetName: raw.cabinetDescription,
    status: raw.status,
    startTime: raw.startTime,
    endTime: raw.endTime,
    aircraftReg: '',
  }
}

export async function listShifts(_userId?: number): Promise<Shift[]> {
  const raw = await request<ShiftResponse[]>('/api/shifts', { auth: true })
  return raw.map(r => toDomain(r))
}

export async function getShiftsByUser(userId: number): Promise<Shift[]> {
  const raw = await request<ShiftResponse[]>(`/api/shifts/user/${userId}`, { auth: true })
  return raw.map(r => toDomain(r))
}

export async function getShiftsByCabinet(cabinetId: number): Promise<Shift[]> {
  const raw = await request<ShiftResponse[]>(`/api/shifts/cabinet/${cabinetId}`, { auth: true })
  return raw.map(r => toDomain(r))
}

export async function startShift(input: {
  userId: number
  cabinetId: number
  startTime?: string
  endTime?: string
}): Promise<Shift> {
  const startTime = input.startTime ?? new Date().toISOString()
  const endTime = input.endTime ?? new Date(Date.now() + 8 * 3600 * 1000).toISOString()
  const { body, headers } = await requestWithHeaders<ShiftResponse>('/api/shifts', {
    method: 'POST',
    body: { uid: input.userId, cid: input.cabinetId, startTime, endTime },
    auth: true,
  })
  return toDomain(body, parseLocationId(headers) ?? 0)
}

export async function endShift(id: number): Promise<Shift> {
  const raw = await request<ShiftResponse>(`/api/shifts/${id}/end`, {
    method: 'POST',
    auth: true,
  })
  return toDomain(raw, id)
}
