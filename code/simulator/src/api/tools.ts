import { idFromHref, parseLocationId, request, requestWithHeaders } from './client'
import type { Tool, ToolStatus } from '@/types/domain'

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


export async function updateTool(id: number, status: ToolStatus): Promise<Tool> {
    const raw = await request<ToolResponse>(`/api/tools/${id}`, {
        method: 'PUT',
        body: { status: status },
        auth: true,
    })
    return toDomain(raw, id)
}
