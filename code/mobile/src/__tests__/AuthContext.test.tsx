import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Mock API module so tests don't need a running backend
jest.mock('../api/auth', () => ({
  login: jest.fn(),
  me: jest.fn(),
  clearToken: jest.fn(),
}));

import * as authApi from '../api/auth';

const mockLogin = authApi.login as jest.Mock;
const mockMe    = authApi.me    as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.currentUser).toBeNull();
  });

  it('login returns ok and sets user for a mechanic', async () => {
    mockLogin.mockResolvedValue(undefined);
    mockMe.mockResolvedValue({ id: 2, name: 'C. Ferreira', email: 'c.ferreira@atl-mro.pt', role: 'MECHANIC', isActive: true });

    const { result } = renderHook(() => useAuth(), { wrapper });
    let status: string | undefined;
    await act(async () => {
      status = await result.current.login('c.ferreira@atl-mro.pt', '1234');
    });
    expect(status).toBe('ok');
    expect(result.current.currentUser?.email).toBe('c.ferreira@atl-mro.pt');
  });

  it('login returns invalid_credentials on 401', async () => {
    const err = Object.assign(new Error('Unauthorized'), { status: 401 });
    mockLogin.mockRejectedValue(err);

    const { result } = renderHook(() => useAuth(), { wrapper });
    let status: string | undefined;
    await act(async () => {
      status = await result.current.login('c.ferreira@atl-mro.pt', 'wrong');
    });
    expect(status).toBe('invalid_credentials');
    expect(result.current.currentUser).toBeNull();
  });

  it('login returns not_mechanic for non-mechanic role', async () => {
    mockLogin.mockResolvedValue(undefined);
    mockMe.mockResolvedValue({ id: 1, name: 'J. Silva', email: 'j.silva@atl-mro.pt', role: 'ADMIN', isActive: true });

    const { result } = renderHook(() => useAuth(), { wrapper });
    let status: string | undefined;
    await act(async () => {
      status = await result.current.login('j.silva@atl-mro.pt', '1234');
    });
    expect(status).toBe('not_mechanic');
    expect(result.current.currentUser).toBeNull();
  });

  it('logout clears current user', async () => {
    mockLogin.mockResolvedValue(undefined);
    mockMe.mockResolvedValue({ id: 2, name: 'C. Ferreira', email: 'c.ferreira@atl-mro.pt', role: 'MECHANIC', isActive: true });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.login('c.ferreira@atl-mro.pt', '1234'); });
    act(() => { result.current.logout(); });
    expect(result.current.currentUser).toBeNull();
  });
});
