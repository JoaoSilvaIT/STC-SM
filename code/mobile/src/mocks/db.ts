import type { User, Cabinet, Tool } from '../types/domain';

export const mockUsers: User[] = [
  { id: 1, name: 'J. Silva',    email: 'j.silva@atl-mro.pt',    role: 'ADMIN',    isActive: true },
  { id: 2, name: 'C. Ferreira', email: 'c.ferreira@atl-mro.pt', role: 'MECHANIC', isActive: true },
  { id: 3, name: 'A. Costa',    email: 'a.costa@atl-mro.pt',    role: 'MECHANIC', isActive: true },
  { id: 4, name: 'M. Santos',   email: 'm.santos@atl-mro.pt',   role: 'MECHANIC', isActive: true },
  { id: 5, name: 'R. Oliveira', email: 'r.oliveira@atl-mro.pt', role: 'MECHANIC', isActive: true },
];

export const mockCabinets: Cabinet[] = [
  { id: 1, name: 'CAB-001', location: 'Bay Alpha · Wing Station', status: 'OPEN',     isActive: true  },
  { id: 2, name: 'CAB-002', location: 'Bay Alpha · Auxiliary',    status: 'OPEN',     isActive: true  },
  { id: 3, name: 'CAB-003', location: 'Bay Bravo · Engine Shop',  status: 'OPEN',     isActive: true  },
  { id: 4, name: 'CAB-004', location: 'Bay Bravo · Power Plant',  status: 'INACTIVE', isActive: false },
  { id: 5, name: 'CAB-005', location: 'Bay Charlie · Avionics',   status: 'OPEN',     isActive: true  },
  { id: 6, name: 'CAB-006', location: 'Bay Delta · Landing Gear', status: 'CLOSED',   isActive: false },
];

export const mockTools: Tool[] = [
  { id: 101, name: 'Torque Wrench 50Nm',           partNumber: 'TW-50-3/8',  cabinetId: 1, status: 'AVAILABLE', isActive: true },
  { id: 102, name: 'Torque Wrench 200Nm',          partNumber: 'TW-200-1/2', cabinetId: 1, status: 'AVAILABLE', isActive: true },
  { id: 103, name: 'Rivet Gun Set',                partNumber: 'RG-4MM-SET', cabinetId: 1, status: 'AVAILABLE', isActive: true },
  { id: 104, name: 'Safety Wire Pliers Type A',    partNumber: 'SWP-A-001',  cabinetId: 1, status: 'AVAILABLE', isActive: true },
  { id: 105, name: 'Hydraulic Pressure Kit',       partNumber: 'HYD-PK-12',  cabinetId: 1, status: 'AVAILABLE', isActive: true },
  { id: 106, name: 'Control Surface Rigging Tool', partNumber: 'CSR-ATR',    cabinetId: 1, status: 'AVAILABLE', isActive: true },
  { id: 107, name: 'Aircraft Jacking Pad',         partNumber: 'AJP-350',    cabinetId: 1, status: 'AVAILABLE', isActive: true },
  { id: 108, name: 'NDT Ultrasonic Probe',         partNumber: 'NDT-UP-25',  cabinetId: 1, status: 'MISSING',   isActive: true },
  { id: 201, name: 'Socket Set 1/4" Drive',        partNumber: 'SS-14-MET',  cabinetId: 2, status: 'AVAILABLE', isActive: true },
  { id: 202, name: 'Socket Set 1/2" Drive',        partNumber: 'SS-12-MET',  cabinetId: 2, status: 'AVAILABLE', isActive: true },
  { id: 203, name: 'Digital Multimeter Class A',   partNumber: 'DMM-CLA',    cabinetId: 2, status: 'AVAILABLE', isActive: true },
];

export const getToolsForCabinet = (cabinetId: number): Tool[] =>
  mockTools.filter(t => t.cabinetId === cabinetId);
