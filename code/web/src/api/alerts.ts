import { idFromHref, request } from './client'

import type { Alert, AlertType, AlertStatus } from '@/types/domain'

interface AlertResponse {
    type: AlertType,
    timestamp: string,
    userName: string,
    message: string,
    cabinetName: string | null,
    toolName: string | null,
    status: AlertStatus,
    self: string,
}

function toDomain(r: AlertResponse, explicitId?: number): Alert {
    const id = explicitId ?? idFromHref(r.self)
    if (!id) {
        throw new Error('Invalid Alert ID')
    }
    return {
        id,
        type: r.type,
        status: r.status,
        message: r.message,
        userName: r.userName,
        timestamp: r.timestamp,
        cabinetName: r.cabinetName,
        toolName: r.toolName,
        shiftId: null
    }
}

export async function getUnreadAlerts(): Promise<Alert[]> {
    const raw = await request<AlertResponse[]>('/api/alerts/unread', {auth: true})
    return raw.map(r => toDomain(r))
}

export async function updateAlert(id: number): Promise<Alert> {
    const raw = await request<AlertResponse>(`/api/alerts/${id}`, {
        method: 'PUT',
        auth: true,
    })
    return toDomain(raw, id)
}

