import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { ShiftProvider, useShift } from '../context/ShiftContext';
import type { Cabinet, Tool, Shift } from '../types/domain';

// Mock API modules so tests don't need a running backend
jest.mock('../api/shifts', () => ({
  startShift: jest.fn(),
  endShift: jest.fn(),
}));

jest.mock('../api/cabinets', () => ({
  getCabinet: jest.fn(),
}));

jest.mock('../api/tools', () => ({
  listTools: jest.fn(),
  updateTool: jest.fn(),
}));

import * as shiftsApi from '../api/shifts';
import * as cabinetsApi from '../api/cabinets';
import * as toolsApi  from '../api/tools';

const mockStartShift  = shiftsApi.startShift  as jest.Mock;
const mockEndShift    = shiftsApi.endShift    as jest.Mock;
const mockGetCabinet  = cabinetsApi.getCabinet as jest.Mock;
const mockListTools   = toolsApi.listTools    as jest.Mock;
const mockUpdateTool  = toolsApi.updateTool   as jest.Mock;

const mockCabinet: Cabinet = {
  id: 1, name: 'CAB-001', location: 'Bay Alpha', status: 'OPEN', isActive: true,
};

const mockTools: Tool[] = [
  { id: 101, name: 'Torque Wrench', partNumber: 'TW-50', cabinetId: 1, status: 'AVAILABLE', isActive: true },
  { id: 102, name: 'Rivet Gun',     partNumber: 'RG-4',  cabinetId: 1, status: 'AVAILABLE', isActive: true },
];

const mockShift: Shift = {
  id: 10, userId: 2, userName: 'C. Ferreira',
  cabinetId: 1, cabinetName: 'CAB-001',
  status: 'ON_GOING',
  startTime: new Date().toISOString(),
  endTime: null,
};

const mockAssignedShift: Shift = { ...mockShift, status: 'ENDED' };

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ShiftProvider userId={2}>{children}</ShiftProvider>
);

describe('ShiftContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStartShift.mockResolvedValue(mockShift);
    mockEndShift.mockResolvedValue({ ...mockShift, status: 'ENDED' });
    mockGetCabinet.mockResolvedValue(mockCabinet);
    mockListTools.mockResolvedValue(mockTools);
  });

  it('starts with no active shift', () => {
    const { result } = renderHook(() => useShift(), { wrapper });
    expect(result.current.activeShift).toBeNull();
  });

  it('startShift sets active shift and loads cabinet tools', async () => {
    const { result } = renderHook(() => useShift(), { wrapper });
    await act(async () => { await result.current.startShift(mockAssignedShift); });
    expect(result.current.activeShift?.cabinetId).toBe(1);
    expect(result.current.activeShift?.status).toBe('ON_GOING');
    expect(result.current.cabinetTools.length).toBe(2);
  });

  it('takeTool calls API and logs TOOL_REMOVED', async () => {
    const updatedTool = { ...mockTools[0], status: 'IN_USE' as const };
    mockUpdateTool.mockResolvedValue(updatedTool);

    const { result } = renderHook(() => useShift(), { wrapper });
    await act(async () => { await result.current.startShift(mockAssignedShift); });
    await act(async () => { await result.current.takeTool(101); });

    expect(mockUpdateTool).toHaveBeenCalledWith(101, 'IN_USE');
    const tool = result.current.cabinetTools.find(t => t.id === 101);
    expect(tool?.status).toBe('IN_USE');
    expect(result.current.activities.some(a => a.type === 'TOOL_REMOVED' && a.toolId === 101)).toBe(true);
  });

  it('returnTool calls API and logs TOOL_RETURNED', async () => {
    const takenTool    = { ...mockTools[0], status: 'IN_USE'    as const };
    const returnedTool = { ...mockTools[0], status: 'AVAILABLE' as const };
    mockUpdateTool
      .mockResolvedValueOnce(takenTool)
      .mockResolvedValueOnce(returnedTool);

    const { result } = renderHook(() => useShift(), { wrapper });
    await act(async () => { await result.current.startShift(mockAssignedShift); });
    await act(async () => { await result.current.takeTool(101); });
    await act(async () => { await result.current.returnTool(101); });

    const tool = result.current.cabinetTools.find(t => t.id === 101);
    expect(tool?.status).toBe('AVAILABLE');
    expect(result.current.activities.some(a => a.type === 'TOOL_RETURNED' && a.toolId === 101)).toBe(true);
  });

  it('markBroken calls API with BROKEN and logs TOOL_BROKEN', async () => {
    const brokenTool = { ...mockTools[0], status: 'BROKEN' as const };
    mockUpdateTool.mockResolvedValue(brokenTool);

    const { result } = renderHook(() => useShift(), { wrapper });
    await act(async () => { await result.current.startShift(mockAssignedShift); });
    await act(async () => { await result.current.markBroken(101); });

    expect(mockUpdateTool).toHaveBeenCalledWith(101, 'BROKEN');
    const tool = result.current.cabinetTools.find(t => t.id === 101);
    expect(tool?.status).toBe('BROKEN');
    expect(result.current.activities.some(a => a.type === 'TOOL_BROKEN' && a.toolId === 101)).toBe(true);
  });

  it('logAnomaly logs CABINET_ANOMALY activity', async () => {
    const { result } = renderHook(() => useShift(), { wrapper });
    await act(async () => { await result.current.startShift(mockAssignedShift); });
    act(() => { result.current.logAnomaly('CABINET_ANOMALY'); });
    expect(result.current.activities.some(a => a.type === 'CABINET_ANOMALY')).toBe(true);
  });

  it('endShift calls API and clears state', async () => {
    const { result } = renderHook(() => useShift(), { wrapper });
    await act(async () => { await result.current.startShift(mockAssignedShift); });
    await act(async () => { await result.current.endShift(); });

    expect(mockEndShift).toHaveBeenCalledWith(10);
    expect(result.current.activeShift).toBeNull();
    expect(result.current.activities).toHaveLength(0);
  });
});
