import React, { createContext, useContext, useState } from 'react';
import type { Shift, Tool, Activity, Cabinet } from '../types/domain';
import { startShift as apiStartShift, endShift as apiEndShift } from '../api/shifts';
import { listTools, updateTool } from '../api/tools';
import { getCabinet } from '../api/cabinets';
import { createActivity } from '../api/activities';
import { ActivityType } from '../types/domain';

interface ShiftContextType {
  activeShift: Shift | null;
  assignedShift: Shift | null;
  activeCabinet: Cabinet | null;
  cabinetTools: Tool[];
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refreshAssignment(): Promise<void>;
  startShift(shift: Shift): Promise<void>;
  takeTool(toolId: number): Promise<void>;
  returnTool(toolId: number): Promise<void>;
  markBroken(toolId: number): Promise<void>;
  logAnomaly(type: ActivityType): Promise<void>;
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

  const refreshAssignment = async () => {
    if (userId <= 0) return;
    setLoading(true);
    try {
      const { getShiftsByUser } = require('../api/shifts');
      const shifts: Shift[] = await getShiftsByUser(userId);
      
      const ongoing = shifts.find(s => s.status === 'ON_GOING');
      const ended = shifts.find(s => s.status === 'ENDED');
      
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
      setError('Failed to load shift information');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    refreshAssignment();
  }, [userId]);

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

  async function takeTool(toolId: number): Promise<void> {
    if (!activeShift) return;
    const updated = await updateTool(toolId, 'IN_USE');
    setCabinetTools(prev => prev.map(t => (t.id === toolId ? updated : t)));
    addActivity({
      type: 'TOOL_REMOVED',
      userId,
      cabinetId: activeShift.cabinetId,
      toolId,
      toolName: updated.name,
      notes: null,
      shiftId: activeShift.id,
    });
  }

  async function returnTool(toolId: number): Promise<void> {
    if (!activeShift) return;
    const updated = await updateTool(toolId, 'AVAILABLE');
    setCabinetTools(prev => prev.map(t => (t.id === toolId ? updated : t)));
    addActivity({
      type: 'TOOL_RETURNED',
      userId,
      cabinetId: activeShift.cabinetId,
      toolId,
      toolName: updated.name,
      notes: null,
      shiftId: activeShift.id,
    });
  }

  async function markBroken(toolId: number): Promise<void> {
    if (!activeShift) return;
    const updated = await updateTool(toolId, 'BROKEN');
    setCabinetTools(prev => prev.map(t => (t.id === toolId ? updated : t)));
    addActivity({
      type: 'TOOL_BROKEN',
      userId,
      cabinetId: activeShift.cabinetId,
      toolId,
      toolName: updated.name,
      notes: null,
      shiftId: activeShift.id,
    });
  }

  async function logAnomaly(type: ActivityType): Promise<void> {
    if (!activeShift) return;
    try {
      await createActivity(
        type,
        userId,
        null,
        activeShift.cabinetId,
        activeShift.id,
        null
      );
      
      addActivity({
        type: type,
        userId,
        cabinetId: activeShift.cabinetId,
        toolId: null,
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
      setActiveCabinet(null);
      setCabinetTools([]);
      setActivities([]);
    }
  }

  return (
    <ShiftContext.Provider value={{
      activeShift, assignedShift, activeCabinet, cabinetTools, activities,
      loading, error,
      refreshAssignment, startShift, takeTool, returnTool, markBroken, logAnomaly, endShift,
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
