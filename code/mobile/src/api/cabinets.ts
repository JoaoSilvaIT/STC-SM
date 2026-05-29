import { idFromHref, request } from './client';
import type { Cabinet, CabinetStatus } from '../types/domain';

interface CabinetResponse {
  description: string;
  status: string;
  location: string;
  self: string;
}

function toDomain(raw: CabinetResponse): Cabinet {
  const status = raw.status as CabinetStatus;
  return {
    id: idFromHref(raw.self),
    name: raw.description,
    location: raw.location,
    status,
    isActive: status !== 'INACTIVE',
  };
}

export async function listCabinets(): Promise<Cabinet[]> {
  const raw = await request<CabinetResponse[]>('/api/cabinets', { auth: true });
  return raw.map(toDomain);
}
