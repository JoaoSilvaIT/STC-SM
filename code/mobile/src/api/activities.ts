import { idFromHref, request } from './client';
import type { Activity, ActivityType } from '../types/domain';

export async function createActivity(
  type: ActivityType,
  uid: number,
  tid: number | null,
  cid: number | null,
  sid: number | null,
  notes: string | null
): Promise<Activity> {
  const raw = await request<Activity>('/api/activities', {
    method: 'POST',
    body: { type, uid, tid, cid, sid, notes },
    auth: true,
  });
  return raw;
}

/**
 * Backend activity types differ from the mobile domain names, so map them here.
 * Unknown types are passed through so the UI can still render (and be spotted).
 */
const BACKEND_TYPE_MAP: Record<string, ActivityType> = {
  OPEN_CABINET: 'DOOR_OPENED',
  CLOSE_CABINET: 'DOOR_CLOSED',
  REMOVE_TOOL: 'TOOL_REMOVED',
  RETURN_TOOL: 'TOOL_RETURNED',
  TOOL_BROKEN: 'TOOL_BROKEN',
  TOOL_MISSING: 'TOOL_MISSING',
  TOOL_IN_MAINTENANCE: 'TOOL_IN_MAINTENANCE',
  CABINET_ANOMALY: 'CABINET_ANOMALY',
  CABINET_BROKEN: 'CABINET_BROKEN',
  STARTED_SHIFT: 'SHIFT_STARTED',
  ENDED_SHIFT: 'SHIFT_ENDED',
};

function mapType(backendType: string): ActivityType {
  return BACKEND_TYPE_MAP[backendType] ?? (backendType as ActivityType);
}

interface ActivityResponse {
  type: string;
  timestamp: string;
  userName: string;
  cabinetName: string | null;
  toolName: string | null;
  self: string;
  user: string;
  cabinet: string | null;
  tool: string | null;
}

/** Backend PageOutputModel<T> shape. */
interface PageResponse<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

function toDomain(r: ActivityResponse): Activity {
  return {
    id: idFromHref(r.self),
    type: mapType(r.type),
    timestamp: r.timestamp,
    userId: idFromHref(r.user),
    userName: r.userName,
    cabinetId: r.cabinet ? idFromHref(r.cabinet) : 0,
    cabinetName: r.cabinetName ?? undefined,
    toolId: r.tool ? idFromHref(r.tool) : null,
    toolName: r.toolName ?? undefined,
    notes: null,
    shiftId: null,
  };
}

/**
 * Fetch a cabinet's activities, most recent first. Size is generous so a whole
 * shift's worth of events fits in one page (callers slice to the current shift).
 */
export async function getActivitiesByCabinet(
  cabinetId: number,
  size = 200,
): Promise<Activity[]> {
  const url = `/api/activities?cabinetId=${cabinetId}&page=0&size=${size}&sort=id,desc`;
  const raw = await request<PageResponse<ActivityResponse>>(url, { auth: true });
  return raw.items.map(toDomain);
}
