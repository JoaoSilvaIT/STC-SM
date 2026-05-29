import type { Cabinet, Tool, Activity, User, Shift } from '../types/domain';

const now = Date.now();
const mins = (m: number) => new Date(now - m * 60 * 1000).toISOString();
const hrs  = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();

export const mockUsers: User[] = [
  { id: 1, name: 'J. Silva',    email: 'j.silva@atl-mro.pt',    role: 'ADMIN',    isActive: true },
  { id: 2, name: 'C. Ferreira', email: 'c.ferreira@atl-mro.pt', role: 'MECHANIC', isActive: true },
  { id: 3, name: 'A. Costa',    email: 'a.costa@atl-mro.pt',    role: 'MECHANIC', isActive: true },
  { id: 4, name: 'M. Santos',   email: 'm.santos@atl-mro.pt',   role: 'MECHANIC', isActive: true },
  { id: 5, name: 'R. Oliveira', email: 'r.oliveira@atl-mro.pt', role: 'MECHANIC', isActive: true },
];

export const mockCabinets: Cabinet[] = [
  { id: 1, name: 'CAB-001', location: 'Bay Alpha · Wing Station',  status: 'OPEN',       isActive: true, activeShiftId: 1 },
  { id: 2, name: 'CAB-002', location: 'Bay Alpha · Auxiliary',     status: 'OPEN',       isActive: true, activeShiftId: null },
  { id: 3, name: 'CAB-003', location: 'Bay Bravo · Engine Shop',   status: 'OPEN',       isActive: true, activeShiftId: 2 },
  { id: 4, name: 'CAB-004', location: 'Bay Bravo · Power Plant',   status: 'BROKEN',  isActive: true, activeShiftId: null },
  { id: 5, name: 'CAB-005', location: 'Bay Charlie · Avionics',    status: 'OPEN',       isActive: true, activeShiftId: 3 },
  { id: 6, name: 'CAB-006', location: 'Bay Delta · Landing Gear',  status: 'INACTIVE',      isActive: true, activeShiftId: null },
];

export const mockTools: Tool[] = [
  // CAB-001 Bay Alpha Wing
  { id: 101, name: 'Torque Wrench 50Nm',          partNumber: 'TW-50-3/8',  cabinetId: 1, status: 'AVAILABLE',   isActive: true },
  { id: 102, name: 'Torque Wrench 200Nm',         partNumber: 'TW-200-1/2', cabinetId: 1, status: 'IN_USE',      isActive: true },
  { id: 103, name: 'Rivet Gun Set',               partNumber: 'RG-4MM-SET', cabinetId: 1, status: 'AVAILABLE',   isActive: true },
  { id: 104, name: 'Safety Wire Pliers Type A',   partNumber: 'SWP-A-001',  cabinetId: 1, status: 'MISSING',     isActive: true },
  { id: 105, name: 'Hydraulic Pressure Kit',      partNumber: 'HYD-PK-12',  cabinetId: 1, status: 'AVAILABLE',   isActive: true },
  { id: 106, name: 'Control Surface Rigging Tool',partNumber: 'CSR-ATR',    cabinetId: 1, status: 'IN_USE',      isActive: true },
  { id: 107, name: 'Aircraft Jacking Pad',        partNumber: 'AJP-350',    cabinetId: 1, status: 'AVAILABLE',   isActive: true },
  { id: 108, name: 'NDT Ultrasonic Probe',        partNumber: 'NDT-UP-25',  cabinetId: 1, status: 'MAINTENANCE', isActive: true },

  // CAB-002 Bay Alpha Auxiliary
  { id: 201, name: 'Socket Set 1/4" Drive',       partNumber: 'SS-14-MET',  cabinetId: 2, status: 'AVAILABLE',   isActive: true },
  { id: 202, name: 'Socket Set 1/2" Drive',       partNumber: 'SS-12-MET',  cabinetId: 2, status: 'IN_USE',      isActive: true },
  { id: 203, name: 'Digital Multimeter Class A',  partNumber: 'DMM-CLA',    cabinetId: 2, status: 'MISSING',     isActive: true },
  { id: 204, name: 'Allen Key Set Metric',        partNumber: 'AK-M-SET',   cabinetId: 2, status: 'AVAILABLE',   isActive: true },
  { id: 205, name: 'Allen Key Set Imperial',      partNumber: 'AK-I-SET',   cabinetId: 2, status: 'AVAILABLE',   isActive: true },

  // CAB-003 Bay Bravo Engine Shop
  { id: 301, name: 'Borescope Flexible 1m',       partNumber: 'BOR-F-1M',   cabinetId: 3, status: 'AVAILABLE',   isActive: true },
  { id: 302, name: 'Borescope Rigid 30cm',        partNumber: 'BOR-R-30',   cabinetId: 3, status: 'AVAILABLE',   isActive: true },
  { id: 303, name: 'Engine Sling 250kg',          partNumber: 'ENG-SL-250', cabinetId: 3, status: 'AVAILABLE',   isActive: true },
  { id: 304, name: 'Cylinder Compression Tester', partNumber: 'CCT-001',    cabinetId: 3, status: 'AVAILABLE',   isActive: true },
  { id: 305, name: 'Fuel System Pressure Kit',    partNumber: 'FSPC-ATR',   cabinetId: 3, status: 'IN_USE',      isActive: true },
  { id: 306, name: 'Engine Compressor Wash Kit',  partNumber: 'ECW-001',    cabinetId: 3, status: 'IN_USE',      isActive: true },

  // CAB-004 Bay Bravo Power Plant (MAINTENANCE)
  { id: 401, name: 'Snap Ring Pliers Internal',   partNumber: 'SRP-INT',    cabinetId: 4, status: 'MAINTENANCE', isActive: true },
  { id: 402, name: 'Snap Ring Pliers External',   partNumber: 'SRP-EXT',    cabinetId: 4, status: 'MAINTENANCE', isActive: true },
  { id: 403, name: 'Leak Test Dye UV Kit',        partNumber: 'LTD-UV-K',   cabinetId: 4, status: 'MAINTENANCE', isActive: true },

  // CAB-005 Bay Charlie Avionics
  { id: 501, name: 'Pitot-Static Test Set',       partNumber: 'PST-ATR',    cabinetId: 5, status: 'AVAILABLE',   isActive: true },
  { id: 502, name: 'BITE Connector Kit',          partNumber: 'BITE-K1',    cabinetId: 5, status: 'AVAILABLE',   isActive: true },
  { id: 503, name: 'Fiber Optic Inspection Kit',  partNumber: 'FOI-K1',     cabinetId: 5, status: 'IN_USE',      isActive: true },
  { id: 504, name: 'Oscilloscope Portable',       partNumber: 'OSC-P-60',   cabinetId: 5, status: 'AVAILABLE',   isActive: true },
  { id: 505, name: 'Avionics Test Harness',       partNumber: 'ATH-001',    cabinetId: 5, status: 'AVAILABLE',   isActive: true },

  // CAB-006 Bay Delta Landing Gear (OFFLINE — locked)
  { id: 601, name: 'Hydraulic Pressure Gauge',    partNumber: 'HPG-350',    cabinetId: 6, status: 'AVAILABLE',   isActive: true },
  { id: 602, name: 'Safety Wire Pliers Type B',   partNumber: 'SWP-B-002',  cabinetId: 6, status: 'AVAILABLE',   isActive: true },
  { id: 603, name: 'Torque Wrench 400Nm',         partNumber: 'TW-400-3/4', cabinetId: 6, status: 'AVAILABLE',   isActive: true },
];

export const mockShifts: Shift[] = [
  { id: 1, userId: 2, cabinetId: 1, status: 'ACTIVE',     startTime: mins(127), endTime: null,       aircraftReg: 'CS-TUG' },
  { id: 2, userId: 3, cabinetId: 3, status: 'ACTIVE',     startTime: mins(68),  endTime: null,       aircraftReg: 'EC-NPK' },
  { id: 3, userId: 4, cabinetId: 5, status: 'ACTIVE',     startTime: mins(34),  endTime: null,       aircraftReg: 'D-ABCE' },
  { id: 4, userId: 5, cabinetId: 2, status: 'COMPLETED',  startTime: hrs(26),   endTime: hrs(22),    aircraftReg: 'CS-TTQ' },
  { id: 5, userId: 2, cabinetId: 3, status: 'COMPLETED',  startTime: hrs(50),   endTime: hrs(46),    aircraftReg: 'OE-LEB' },
];

export const mockActivities: Activity[] = [
  { id:  1, cabinetId: 1, toolId: null, userId: 2, type: 'SHIFT_STARTED',         timestamp: mins(127), notes: 'Aircraft CS-TUG · Wing inspection C-check', shiftId: 1 },
  { id:  2, cabinetId: 1, toolId: null, userId: 2, type: 'DOOR_OPENED',            timestamp: mins(124), notes: null,  shiftId: 1 },
  { id:  3, cabinetId: 1, toolId: 102,  userId: 2, type: 'TOOL_REMOVED',           timestamp: mins(123), notes: null,  shiftId: 1 },
  { id:  4, cabinetId: 1, toolId: 106,  userId: 2, type: 'TOOL_REMOVED',           timestamp: mins(122), notes: null,  shiftId: 1 },
  { id:  5, cabinetId: 1, toolId: null, userId: 2, type: 'DOOR_CLOSED',            timestamp: mins(121), notes: null,  shiftId: 1 },
  { id:  6, cabinetId: 3, toolId: null, userId: 3, type: 'SHIFT_STARTED',         timestamp: mins(68),  notes: 'Aircraft EC-NPK · Engine borescope inspection', shiftId: 2 },
  { id:  7, cabinetId: 3, toolId: null, userId: 3, type: 'DOOR_OPENED',            timestamp: mins(65),  notes: null,  shiftId: 2 },
  { id:  8, cabinetId: 3, toolId: 305,  userId: 3, type: 'TOOL_REMOVED',           timestamp: mins(64),  notes: null,  shiftId: 2 },
  { id:  9, cabinetId: 3, toolId: 306,  userId: 3, type: 'TOOL_REMOVED',           timestamp: mins(63),  notes: null,  shiftId: 2 },
  { id: 10, cabinetId: 3, toolId: null, userId: 3, type: 'DOOR_CLOSED',            timestamp: mins(62),  notes: null,  shiftId: 2 },
  { id: 11, cabinetId: 1, toolId: 104,  userId: 2, type: 'TOOL_MISSING_DETECTED',  timestamp: mins(58),  notes: 'RFID scan failed — tool not detected in cabinet', shiftId: 1 },
  { id: 12, cabinetId: 5, toolId: null, userId: 4, type: 'SHIFT_STARTED',         timestamp: mins(34),  notes: 'Aircraft D-ABCE · Avionics systems check', shiftId: 3 },
  { id: 13, cabinetId: 5, toolId: null, userId: 4, type: 'DOOR_OPENED',            timestamp: mins(32),  notes: null,  shiftId: 3 },
  { id: 14, cabinetId: 5, toolId: 503,  userId: 4, type: 'TOOL_REMOVED',           timestamp: mins(31),  notes: null,  shiftId: 3 },
  { id: 15, cabinetId: 5, toolId: null, userId: 4, type: 'DOOR_CLOSED',            timestamp: mins(30),  notes: null,  shiftId: 3 },
  { id: 16, cabinetId: 2, toolId: 203,  userId: 1, type: 'TOOL_MISSING_DETECTED',  timestamp: mins(22),  notes: 'RFID scan failed — tool not detected in cabinet', shiftId: null },
  { id: 17, cabinetId: 4, toolId: null, userId: 1, type: 'CABINET_OFFLINE',        timestamp: mins(15),  notes: 'Scheduled maintenance cycle initiated', shiftId: null },
  { id: 18, cabinetId: 1, toolId: null, userId: 2, type: 'DOOR_OPENED',            timestamp: mins(8),   notes: null,  shiftId: 1 },
  { id: 19, cabinetId: 1, toolId: 102,  userId: 2, type: 'TOOL_RETURNED',          timestamp: mins(7),   notes: null,  shiftId: 1 },
  { id: 20, cabinetId: 1, toolId: null, userId: 2, type: 'DOOR_CLOSED',            timestamp: mins(6),   notes: null,  shiftId: 1 },
];

// Lookup helpers
export const getUserById    = (id: number) => mockUsers.find(u => u.id === id);
export const getCabinetById = (id: number) => mockCabinets.find(c => c.id === id);
export const getToolById    = (id: number) => mockTools.find(t => t.id === id);
export const getShiftById   = (id: number) => mockShifts.find(s => s.id === id);

export const getToolsForCabinet   = (cabinetId: number) => mockTools.filter(t => t.cabinetId === cabinetId && t.isActive);
export const getActiveShiftForCabinet = (cabinetId: number) => mockShifts.find(s => s.cabinetId === cabinetId && s.status === 'ACTIVE');
