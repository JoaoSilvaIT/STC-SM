import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types/domain';
import { login as apiLogin, me, clearToken } from '../api/auth';
import { loadToken } from '../api/client';

type LoginResult = 'ok' | 'invalid_credentials' | 'not_mechanic' | 'error';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  /** True while restoring a persisted session on startup. */
  bootstrapping: boolean;
  login(email: string, password: string): Promise<LoginResult>;
  logout(): void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  // On startup, restore a persisted token and validate it by fetching the user.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await loadToken();
        if (!token) return;
        const user = await me();
        if (cancelled) return;
        if (user.role === 'MECHANIC') {
          setCurrentUser(user);
        } else {
          clearToken();
        }
      } catch {
        clearToken(); // token expired / invalid — fall back to login
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function login(email: string, password: string): Promise<LoginResult> {
    setLoading(true);
    try {
      await apiLogin(email, password);
      const user = await me();
      if (user.role !== 'MECHANIC') {
        clearToken();
        return 'not_mechanic';
      }
      setCurrentUser(user);
      return 'ok';
    } catch (e: unknown) {
      const status = (e as { status?: number }).status;
      if (status === 401 || status === 403) return 'invalid_credentials';
      return 'error';
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearToken();
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, bootstrapping, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
