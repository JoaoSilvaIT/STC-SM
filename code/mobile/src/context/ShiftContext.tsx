import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Shift, Tool, Activity, Cabinet, ActivityType } from '../types/domain';
import { startShift as apiStartShift, endShift as apiEndShift, getShiftsByUser } from '../api/shifts';
import { listTools } from '../api/tools';
import { getCabinet } from '../api/cabinets';
import { createActivity, getActivitiesByCabinet } from '../api/activities';

interface ShiftContextType {

  activeShift: Shift | null;
  assignedShift: Shift | null;
  activeCabinet: Cabinet | null;
  cabinetTools: Tool[];
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refreshAssignment(silent?: boolean): Promise<void>;
  refreshActivities(): Promise<void>;
  startShift(shift: Shift): Promise<void>;
  logAnomaly(type: ActivityType, toolId?: number): Promise<void>;
  endShift(): Promise<void>;
}


const ShiftContext = createContext<ShiftContextType | null>(null);

let activityIdCounter = 1;

export function ShiftProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: number;
}) {
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [assignedShift, setAssignedShift] = useState<Shift | null>(null);
  const [activeCabinet, setActiveCabinet] = useState<Cabinet | null>(null);
  const [cabinetTools, setCabinetTools] = useState<Tool[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAssignment = useCallback(async (silent = false) => {
    if (userId <= 0) return;
    if (!silent) setLoading(true);
    try {
      const shifts: Shift[] = await getShiftsByUser(userId);
      
      const ongoing = shifts.find(s => s.status === 'ACTIVE');
      const ended = shifts.find(s => s.status === 'INACTIVE');
      
      const target = ongoing || ended;
      
      if (target) {
        setAssignedShift(target);
        const cab = await getCabinet(target.cabinetId);
        setActiveCabinet(cab);
        
        if (ongoing) {
          const allTools = await listTools();
          const tools = allTools.filter(t => t.cabinetId === ongoing.cabinetId);
          setActiveShift(ongoing);
          setCabinetTools(tools);
        } else {
          setActiveShift(null);
          setCabinetTools([]);
        }
      } else {
        setAssignedShift(null);
        setActiveShift(null);
        setActiveCabinet(null);
        setCabinetTools([]);
      }
    } catch (e) {
      // Don't surface transient errors from a background poll
      if (!silent) setError('Failed to load shift information');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    refreshAssignment();
  }, [userId]);

  // Pull the current shift's activity from the backend so events created
  // elsewhere (e.g. the mechanic operating the cabinet via the simulator) show
  // up too. The backend is the source of truth; we scope to the current shift by
  // cutting the cabinet's activity list at its most recent SHIFT_STARTED event.
  const refreshActivities = useCallback(async () => {
    if (!activeShift) return;
    try {
      const all = await getActivitiesByCabinet(activeShift.cabinetId);
      const startIdx = all.findIndex(a => a.type === 'SHIFT_STARTED');
      setActivities(startIdx >= 0 ? all.slice(0, startIdx + 1) : all);
    } catch {
      // Ignore transient errors from a background poll
    }
  }, [activeShift]);

  function addActivity(partial: Omit<Activity, 'id' | 'timestamp'>): void {
    setActivities(prev => [
      { ...partial, id: activityIdCounter++, timestamp: new Date().toISOString() },
      ...prev,
    ]);
  }

  async function startShift(assignedShift: Shift): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const shift = await apiStartShift(assignedShift.id);
      const cabinet = await getCabinet(shift.cabinetId);
      const allTools = await listTools();
      const tools = allTools.filter(t => t.cabinetId === shift.cabinetId);

      setActiveShift(shift);
      setActiveCabinet(cabinet);
      setCabinetTools(tools);
      setActivities([{
        id: activityIdCounter++,
        type: 'SHIFT_STARTED',
        userId,
        cabinetId: cabinet.id,
        cabinetName: cabinet.name,
        toolId: null,
        timestamp: new Date().toISOString(),
        notes: null,
        shiftId: shift.id,
      }]);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to start shift');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function logAnomaly(type: ActivityType, toolId?: number): Promise<void> {
    if (!activeShift) return;
    try {
      await createActivity(
        type,
        userId,
        toolId ?? null,
        activeShift.cabinetId,
        activeShift.id,
        null
      );

      addActivity({
        type,
        userId,
        cabinetId: activeShift.cabinetId,
        toolId: toolId ?? null,
        toolName: toolId ? cabinetTools.find(t => t.id === toolId)?.name : undefined,
        notes: null,
        shiftId: activeShift.id,
      });
    } catch (e: unknown) {
      console.error('Failed to log anomaly to backend:', e);
      throw e;
    }
  }

  async function endShift(): Promise<void> {
    if (!activeShift) return;
    setLoading(true);
    try {
      const missingTools = cabinetTools.filter(t => t.status === 'IN_USE');
      for (const tool of missingTools) {
        try {
          await createActivity(
            'TOOL_MISSING',
            userId,
            tool.id,
            activeShift.cabinetId,
            activeShift.id,
            null
          );
        } catch (e) {
          console.error('Failed to log missing tool activity on endShift', e);
        }
      }

      await apiEndShift(activeShift.id);
    } finally {
      setLoading(false);
      setActiveShift(null);
      setActivities([]);
    }
  }

  return (
    <ShiftContext.Provider value={{
      activeShift, assignedShift, activeCabinet, cabinetTools, activities,
      loading, error,
      refreshAssignment, refreshActivities, startShift, logAnomaly, endShift,
    }}>
      {children}
    </ShiftContext.Provider>
  );
}

export function useShift(): ShiftContextType {
  const ctx = useContext(ShiftContext);
  if (!ctx) throw new Error('useShift must be used inside ShiftProvider');
  return ctx;
}
