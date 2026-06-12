export type ToolStatus = 'AVAILABLE'
    | 'IN_USE'
    | 'MISSING'
    | 'IN_MAINTENANCE'
    | 'BROKEN';
export type CabinetStatus = 'BROKEN'
    | 'INACTIVE'
    | 'OPEN'
    | 'CLOSED';
export type ActivityType = 'OPEN_CABINET'
    | 'CLOSE_CABINET'
    | 'REMOVE_TOOL'
    | 'TOOL_BROKEN'
    | 'TOOL_MISSING'
    | 'TOOL_IN_MAINTENANCE'
    | 'CABINET_ANOMALY'
    | 'STARTED_SHIFT'
    | 'ENDED_SHIFT';
export type UserRole = 'ADMIN' | 'MECHANIC' | 'BACK_OFFICE';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type ShiftStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

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
}

export interface Shift {
  id: number;
  userId: number;
  userName: string | null;
  cabinetId: number;
  cabinetName: string | null;
  status: ShiftStatus;
  startTime: string;
  endTime: string | null;
}

export interface Activity {
  id: number;
  cabinetId: number | null;
  cabinetName: string | null;
  toolId: number | null;
  toolName: string | null;
  userId: number;
  userName: string | null;
  type: ActivityType;
  timestamp: string;
  notes: string | null;
  shiftId: number | null;
}
