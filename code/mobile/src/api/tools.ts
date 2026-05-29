import { idFromHref, request } from './client';
import type { Tool, ToolStatus } from '../types/domain';

interface ToolResponse {
  name: string;
  partNumber: string;
  status: string;
  isActive: boolean;
  self: string;
  cabinet: string;
}

function toDomain(raw: ToolResponse): Tool {
  return {
    id: idFromHref(raw.self),
    name: raw.name,
    partNumber: raw.partNumber,
    cabinetId: idFromHref(raw.cabinet),
    status: raw.status as ToolStatus,
    isActive: raw.isActive,
  };
}

export async function listTools(): Promise<Tool[]> {
  const raw = await request<ToolResponse[]>('/api/tools', { auth: true });
  return raw.map(toDomain);
}

export async function updateTool(id: number, status: ToolStatus): Promise<Tool> {
  const raw = await request<ToolResponse>(`/api/tools/${id}`, {
    method: 'PUT',
    body: { status },
    auth: true,
  });
  return toDomain(raw);
}
