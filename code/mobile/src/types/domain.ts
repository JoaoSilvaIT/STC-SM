export type ToolStatus = 'AVAILABLE' | 'IN_USE' | 'BROKEN' | 'MISSING';
export type CabinetStatus = 'OPEN' | 'CLOSED' | 'BROKEN' | 'INACTIVE';
export type ActivityType =
  | 'SHIFT_STARTED'
  | 'SHIFT_ENDED'
  | 'TOOL_REMOVED'
  | 'TOOL_RETURNED'
  | 'TOOL_BROKEN'
  | 'TOOL_MISSING'
  | 'TOOL_MISSING_DETECTED'
  | 'DOOR_OPENED'
  | 'DOOR_CLOSED'
  | 'CABINET_ONLINE'
  | 'CABINET_OFFLINE'
  | 'CABINET_ANOMALY';
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
  isActive: boolean;
}

export interface Tool {
  id: number;
  name: string;
  partNumber: string;
  cabinetId: number;
  status: ToolStatus;
  isActive: boolean;
}

export interface Shift {
  id: number;
  userId: number;
  userName?: string;
  cabinetId: number;
  cabinetName?: string;
  status: ShiftStatus;
  startTime: string;
  endTime: string | null;
}

export interface Activity {
  id: number;
  cabinetId: number;
  cabinetName?: string;
  toolId: number | null;
  toolName?: string;
  userId: number;
  userName?: string;
  type: ActivityType;
  timestamp: string;
  notes: string | null;
  shiftId: number | null;
}
