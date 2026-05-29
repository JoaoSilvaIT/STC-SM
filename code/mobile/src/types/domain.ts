export type ToolStatus = 'AVAILABLE' | 'IN_USE' | 'BROKEN' | 'MISSING';
export type CabinetStatus = 'OPEN' | 'CLOSED' | 'BROKEN' | 'INACTIVE';
export type ActivityType =
  | 'TOOL_REMOVED'
  | 'TOOL_RETURNED'
  | 'DOOR_OPENED'
  | 'DOOR_CLOSED'
  | 'SHIFT_STARTED'
  | 'SHIFT_ENDED'
  | 'CABINET_ONLINE'
  | 'CABINET_OFFLINE'
  | 'TOOL_MISSING_DETECTED'
  | 'TOOL_BROKEN'        // mobile-local: logged when mechanic marks a tool broken
  | 'CABINET_ANOMALY';   // mobile-local: logged when mechanic reports an anomaly
export type UserRole = 'ADMIN' | 'MECHANIC' | 'BACK_OFFICE';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type ShiftStatus = 'ACTIVE' | 'COMPLETED';

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
  aircraftReg: string;
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
