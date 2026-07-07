import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { ShiftProvider, useShift } from '../context/ShiftContext';
import type { Cabinet, Tool, Shift, Activity } from '../types/domain';

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
}));

jest.mock('../api/activities', () => ({
  createActivity: jest.fn(),
  getActivitiesByCabinet: jest.fn(),
}));

import * as shiftsApi from '../api/shifts';
import * as cabinetsApi from '../api/cabinets';
import * as toolsApi  from '../api/tools';
import * as activitiesApi from '../api/activities';

const mockStartShift    = shiftsApi.startShift  as jest.Mock;
const mockEndShift      = shiftsApi.endShift    as jest.Mock;
const mockGetCabinet    = cabinetsApi.getCabinet as jest.Mock;
const mockListTools     = toolsApi.listTools    as jest.Mock;
const mockCreateActivity = activitiesApi.createActivity as jest.Mock;
const mockGetActivitiesByCabinet = activitiesApi.getActivitiesByCabinet as jest.Mock;

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
  status: 'ACTIVE',
  startTime: new Date().toISOString(),
  endTime: null,
};

const mockAssignedShift: Shift = { ...mockShift, status: 'INACTIVE' };

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
    mockCreateActivity.mockResolvedValue(undefined);
    mockGetActivitiesByCabinet.mockResolvedValue([]);
  });

  it('starts with no active shift', () => {
    const { result } = renderHook(() => useShift(), { wrapper });
    expect(result.current.activeShift).toBeNull();
  });

  it('startShift sets active shift and loads cabinet tools', async () => {
    const { result } = renderHook(() => useShift(), { wrapper });
    await act(async () => { await result.current.startShift(mockAssignedShift); });
    expect(result.current.activeShift?.cabinetId).toBe(1);
    expect(result.current.activeShift?.status).toBe('ACTIVE');
    expect(result.current.cabinetTools.length).toBe(2);
  });

  it('logAnomaly logs CABINET_ANOMALY activity', async () => {
    const { result } = renderHook(() => useShift(), { wrapper });
    await act(async () => { await result.current.startShift(mockAssignedShift); });
    await act(async () => { await result.current.logAnomaly('CABINET_ANOMALY'); });
    expect(mockCreateActivity).toHaveBeenCalled();
    expect(result.current.activities.some(a => a.type === 'CABINET_ANOMALY')).toBe(true);
  });

  it('refreshActivities loads the shift activities from the backend', async () => {
    const backendFeed: Activity[] = [
      { id: 30, type: 'TOOL_REMOVED',  userId: 2, cabinetId: 1, toolId: 101, notes: null, shiftId: 10, timestamp: new Date().toISOString() },
      { id: 20, type: 'SHIFT_STARTED', userId: 2, cabinetId: 1, toolId: null, notes: null, shiftId: 10, timestamp: new Date().toISOString() },
      { id: 10, type: 'SHIFT_ENDED',   userId: 2, cabinetId: 1, toolId: null, notes: null, shiftId: 9,  timestamp: new Date().toISOString() },
    ];
    mockGetActivitiesByCabinet.mockResolvedValue(backendFeed);

    const { result } = renderHook(() => useShift(), { wrapper });
    await act(async () => { await result.current.startShift(mockAssignedShift); });
    await act(async () => { await result.current.refreshActivities(); });

    expect(mockGetActivitiesByCabinet).toHaveBeenCalledWith(1);
    // The feed comes from the backend, scoped to the current shift (cut at the most recent SHIFT_STARTED)
    expect(result.current.activities.map(a => a.type)).toEqual(['TOOL_REMOVED', 'SHIFT_STARTED']);
    expect(result.current.activities.some(a => a.type === 'SHIFT_ENDED')).toBe(false);
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
