export type ToolStatus = 'AVAILABLE'
    | 'IN_USE'
    | 'MISSING'
    | 'IN_MAINTENANCE'
    | 'BROKEN';

export type CabinetStatus = 'BROKEN'
    | 'INACTIVE'
    | 'OPEN'
    | 'CLOSED';

export interface Cabinet {
    id: number;
    name: string;
    location: string;
    status: CabinetStatus;
    activeShiftId: number | null;
}

export interface Tool {
    id: number;
    name: string;
    partNumber: string;
    cabinetId: number;
    status: ToolStatus;
    isActive: boolean;
}

export type UserRole = 'ADMIN' | 'MECHANIC' | 'BACK_OFFICE';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
}