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

/** Backend PageOutputModel<T> shape. */
interface PageResponse<T> {
  items: T[]
  currentPage: number
  totalPages: number
  totalItems: number
}

export interface ActivityPage {
  items: Activity[]
  currentPage: number
  totalPages: number
  totalItems: number
}

export async function listActivities(
  page = 0,
  size = 25,
  type?: ActivityType | null,
  cabinetId?: number | null,
): Promise<ActivityPage> {
  let url = `/api/activities?page=${page}&size=${size}&sort=id,desc`
  if (type) url += `&type=${type}`
  if (cabinetId != null) url += `&cabinetId=${cabinetId}`
  const raw = await request<PageResponse<ActivityResponse>>(url, { auth: true })
  return {
    items: raw.items.map(toDomain),
    currentPage: raw.currentPage,
    totalPages: raw.totalPages,
    totalItems: raw.totalItems,
  }
}

export async function getActivity(id: number): Promise<Activity> {
  const raw = await request<ActivityResponse>(`/api/activities/${id}`, { auth: true })
  return toDomain(raw)
}
