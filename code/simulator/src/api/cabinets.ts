import { idFromHref, parseLocationId, request, requestWithHeaders } from './client'
import type { Cabinet, CabinetStatus } from '@/types/domain'

interface CabinetResponse {
    description: string
    status: CabinetStatus
    location: string
    self: string
}

function toDomain(raw: CabinetResponse, explicitId?: number): Cabinet {
    const id = explicitId ?? idFromHref(raw.self)
    if (!id) {
        throw new Error('Invalid Cabinet ID')
    }
    return {
        id,
        name: raw.description,
        location: raw.location,
        status: raw.status,
        activeShiftId: null,
    }
}

export async function listCabinets(): Promise<Cabinet[]> {
    const raw = await request<CabinetResponse[]>('/api/cabinets', { auth: true })
    return raw.map(r => toDomain(r))
}

export async function getCabinet(id: number): Promise<Cabinet> {
    const raw = await request<CabinetResponse>(`/api/cabinets/${id}`, { auth: true })
    return toDomain(raw, id)
}

export async function createCabinet(input: { name: string; location: string; status: CabinetStatus }): Promise<Cabinet> {
    const { body, headers } = await requestWithHeaders<CabinetResponse>('/api/cabinets', {
        method: 'POST',
        body: {
            description: input.name,
            location: input.location,
            status: input.status,
        },
        auth: true,
    })
    return toDomain(body, parseLocationId(headers) ?? 0)
}

export async function updateCabinet(id: number, status: CabinetStatus): Promise<Cabinet> {
    const raw = await request<CabinetResponse>(`/api/cabinets/${id}`, {
        method: 'PUT',
        body: { status },
        auth: true,
    })
    return toDomain(raw, id)
}
