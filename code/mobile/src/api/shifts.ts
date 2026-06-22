import { idFromHref, request } from './client';
import type { Shift, ShiftStatus } from '../types/domain';

interface ShiftResponse {
  userName: string;
  cabinetDescription: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  self: string;
  user: string;
  cabinet: string;
}

function toDomain(raw: ShiftResponse): Shift {
  return {
    id: idFromHref(raw.self),
    userId: idFromHref(raw.user),
    userName: raw.userName,
    cabinetId: idFromHref(raw.cabinet),
    cabinetName: raw.cabinetDescription,
    status: raw.status,
    startTime: raw.startTime,
    endTime: raw.endTime,
  };
}

export async function createShift(userId: number, cabinetId: number): Promise<Shift> {
  const startTime = new Date().toISOString();
  // Default 8-hour window; the shift is ended explicitly via endShift()
  const endTime = new Date(Date.now() + 8 * 3600 * 1000).toISOString();
  const raw = await request<ShiftResponse>('/api/shifts', {
    method: 'POST',
    body: { uid: userId, cid: cabinetId, startTime, endTime },
    auth: true,
  });
  return toDomain(raw);
}

export async function getShiftsByUser(userId: number): Promise<Shift[]> {
  const raw = await request<ShiftResponse[]>(`/api/shifts/user/${userId}`, { auth: true });
  return raw.map(toDomain);
}

export async function startShift(id: number): Promise<Shift> {
  const raw = await request<ShiftResponse>(`/api/shifts/start/${id}`, {
    method: 'PUT',
    auth: true,
  });
  return toDomain(raw);
}

export async function endShift(id: number): Promise<Shift> {
  const raw = await request<ShiftResponse>(`/api/shifts/end/${id}`, {
    method: 'PUT',
    auth: true,
  });
  return toDomain(raw);
}

export async function checkCabinetOccupied(cabinetId: number): Promise<boolean> {
  const raw = await request<boolean>(`/api/shifts/active/cabinet/${cabinetId}`, {
    auth: true
  });
  return raw;
}