import { request } from './client';
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
