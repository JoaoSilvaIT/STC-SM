import React, { createContext, useContext, useState } from 'react';
import type { Shift, Tool, Activity, Cabinet } from '../types/domain';
import { createShift as apiCreateShift, endShift as apiEndShift } from '../api/shifts';
import { listTools, updateTool } from '../api/tools';

export type AnomalyType = 'DOOR_MALFUNCTION' | 'POWER_ISSUE' | 'SENSOR_FAILURE' | 'OTHER';

interface ShiftContextType {
  activeShift: Shift | null;
  activeCabinet: Cabinet | null;
  cabinetTools: Tool[];
  activities: Activity[];
  loading: boolean;
  error: string | null;
  startShift(cabinet: Cabinet, aircraftReg: string): Promise<void>;
  takeTool(toolId: number): Promise<void>;
  returnTool(toolId: number): Promise<void>;
  markBroken(toolId: number): Promise<void>;
  logAnomaly(type: AnomalyType, notes: string): void;
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
  const [activeCabinet, setActiveCabinet] = useState<Cabinet | null>(null);
  const [cabinetTools, setCabinetTools] = useState<Tool[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addActivity(partial: Omit<Activity, 'id' | 'timestamp'>): void {
    setActivities(prev => [
      { ...partial, id: activityIdCounter++, timestamp: new Date().toISOString() },
      ...prev,
    ]);
  }

  async function startShift(cabinet: Cabinet, aircraftReg: string): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const shift = await apiCreateShift(userId, cabinet.id);
      const allTools = await listTools();
      const tools = allTools.filter(t => t.cabinetId === cabinet.id);

      setActiveShift({ ...shift, aircraftReg });
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
        notes: `Aircraft ${aircraftReg}`,
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

  function logAnomaly(type: AnomalyType, notes: string): void {
    if (!activeShift) return;
    addActivity({
      type: 'CABINET_ANOMALY',
      userId,
      cabinetId: activeShift.cabinetId,
      toolId: null,
      notes: `${type}${notes ? ': ' + notes : ''}`,
      shiftId: activeShift.id,
    });
  }

  async function endShift(): Promise<void> {
    if (!activeShift) return;
    setLoading(true);
    try {
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
      activeShift, activeCabinet, cabinetTools, activities,
      loading, error,
      startShift, takeTool, returnTool, markBroken, logAnomaly, endShift,
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
