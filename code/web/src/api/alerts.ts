import { idFromHref, request } from './client'

import type { Alert, AlertType, AlertStatus } from '@/types/domain'

const API_BASE = '/api/alerts'

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

function toDomain(r: AlertResponse): Alert {
    return {
        id: idFromHref(r.self),
        type: r.type,
        status: r.status,
        message: r.message,
        userName: r.userName,
        timestamp: r.timestamp,
        cabinetName: r.cabinetName ?? undefined,
        toolName: r.toolName ?? undefined,
        shiftId: null
    }
}

export async function getUnreadAlerts(): Promise<Alert[]> {
    const raw = await request<AlertResponse[]>('/api/alerts/unread', {auth: true})
    return raw.map(toDomain)
}

