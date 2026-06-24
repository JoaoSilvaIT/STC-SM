import { idFromHref, request } from './client'
import type { Activity, ActivityType } from '@/types/domain'

interface ActivityResponse {
  type: ActivityType
  timestamp: string
  userName: string
  cabinetName: string | null
  toolName: string | null
  self: string
  user: string
  cabinet: string | null
  tool: string | null
}

function toDomain(r: ActivityResponse): Activity {
  return {
    id: idFromHref(r.self),
    type: r.type,
    timestamp: r.timestamp,
    userId: idFromHref(r.user),
    userName: r.userName,
    cabinetId: r.cabinet ? idFromHref(r.cabinet) : 0,
    cabinetName: r.cabinetName,
    toolId: r.tool ? idFromHref(r.tool) : null,
    toolName: r.toolName,
    notes: null,
    shiftId: null,
  }
}

export async function listActivities(): Promise<Activity[]> {
  const raw = await request<ActivityResponse[]>('/api/activities', { auth: true })
  return raw.map(toDomain)
}

export async function getActivity(id: number): Promise<Activity> {
  const raw = await request<ActivityResponse>(`/api/activities/${id}`, { auth: true })
  return toDomain(raw)
}
