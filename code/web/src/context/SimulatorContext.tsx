import { createContext, useContext, useState, useCallback } from 'react'
import {
  mockCabinets, mockTools, mockShifts, mockUsers,
  getUserById, getCabinetById, getToolById,
} from '@/mocks/db'
import type { Cabinet, Tool, Activity, ActivityType } from '@/types/domain'

export interface ToolSlot {
  tool: Tool
  present: boolean
}

export interface CabinetSim {
  cabinet: Cabinet
  door: 'OPEN' | 'CLOSED'
  slots: ToolSlot[]
}

interface SimulatorContextType {
  cabinets: CabinetSim[]
  activities: Activity[]
  toggleTool(cabinetId: number, toolId: number): void
  toggleDoor(cabinetId: number): void
  resetAll(): void
}

const SimulatorContext = createContext<SimulatorContextType | null>(null)

function buildInitialCabinets(): CabinetSim[] {
  return mockCabinets.map(cabinet => ({
    cabinet,
    door: 'CLOSED' as const,
    slots: mockTools
      .filter(t => t.cabinetId === cabinet.id)
      .map(tool => ({ tool: { ...tool, status: 'AVAILABLE' as Tool['status'] }, present: true })),
  }))
}

let activityId = 1000

function makeActivity(
  type: ActivityType,
  cabinetId: number,
  toolId: number | null,
): Activity {
  return {
    id: activityId++,
    cabinetId,
    toolId,
    userId: 1,
    type,
    timestamp: new Date().toISOString(),
    notes: null,
    shiftId: null,
  }
}

export function SimulatorProvider({ children }: { children: React.ReactNode }) {
  const [cabinets, setCabinets] = useState<CabinetSim[]>(buildInitialCabinets)
  const [activities, setActivities] = useState<Activity[]>([])

  const addActivity = useCallback((act: Activity) => {
    setActivities(prev => [act, ...prev].slice(0, 50))
  }, [])

  const toggleTool = useCallback((cabinetId: number, toolId: number) => {
    let type: ActivityType = 'TOOL_REMOVED'
    setCabinets(prev => prev.map(cs => {
      if (cs.cabinet.id !== cabinetId) return cs
      const slots = cs.slots.map(s => {
        if (s.tool.id !== toolId) return s
        const nowPresent = !s.present
        type = nowPresent ? 'TOOL_RETURNED' : 'TOOL_REMOVED'
        const newStatus: Tool['status'] = nowPresent ? 'AVAILABLE' : 'IN_USE'
        return { ...s, present: nowPresent, tool: { ...s.tool, status: newStatus } }
      })
      return { ...cs, slots }
    }))
    addActivity(makeActivity(type, cabinetId, toolId))
  }, [addActivity])

  const toggleDoor = useCallback((cabinetId: number) => {
    let type: ActivityType = 'DOOR_OPENED'
    setCabinets(prev => prev.map(cs => {
      if (cs.cabinet.id !== cabinetId) return cs
      const newDoor = cs.door === 'OPEN' ? 'CLOSED' : 'OPEN'
      type = newDoor === 'OPEN' ? 'DOOR_OPENED' : 'DOOR_CLOSED'
      return { ...cs, door: newDoor }
    }))
    addActivity(makeActivity(type, cabinetId, null))
  }, [addActivity])

  const resetAll = useCallback(() => {
    setCabinets(buildInitialCabinets())
    setActivities([])
  }, [])

  return (
    <SimulatorContext.Provider value={{ cabinets, activities, toggleTool, toggleDoor, resetAll }}>
      {children}
    </SimulatorContext.Provider>
  )
}

export function useSimulator(): SimulatorContextType {
  const ctx = useContext(SimulatorContext)
  if (!ctx) throw new Error('useSimulator must be used inside SimulatorProvider')
  return ctx
}

export function useSimulatorTools(sim: SimulatorContextType): Tool[] {
  return sim.cabinets.flatMap(cs => cs.slots.map(s => s.tool))
}

export function useSimulatorCabinets(sim: SimulatorContextType): Cabinet[] {
  return sim.cabinets.map(cs => cs.cabinet)
}

export { mockShifts, mockUsers, getUserById, getCabinetById, getToolById }
