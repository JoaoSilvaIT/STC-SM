import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth'
import { getToken, setToken } from '../api/client'
import type { User } from '@/types/domain'

interface AuthState {
    user: User | null
    token: string | null
    ready: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

const USER_KEY = 'stc_user'

function readStoredUser(): User | null {
    try { return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') } catch { return null }
}

function writeStoredUser(user: User | null) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser]        = useState<User | null>(readStoredUser)
    const [token, setTokenState] = useState<string | null>(getToken)
    const [ready, setReady]      = useState<boolean>(!getToken())

    useEffect(() => {
        if (!token) { setReady(true); return }
        let cancelled = false
        authApi.me()
            .then(u => {
                if (cancelled) return
                setUser(u); writeStoredUser(u)
            })
            .catch(() => {
                if (cancelled) return
                setToken(null); setTokenState(null)
                setUser(null);  writeStoredUser(null)
            })
            .finally(() => { if (!cancelled) setReady(true) })
        return () => { cancelled = true }
    }, [token])

    const login = async (email: string, password: string) => {
        const { token: newToken } = await authApi.login(email, password)
        setToken(newToken); setTokenState(newToken)
        const u = await authApi.me()
        setUser(u); writeStoredUser(u)
    }

    const logout = async () => {
        try { await authApi.logout() } catch { /* token may already be invalid; clear anyway */ }
        setToken(null); setTokenState(null)
        setUser(null);  writeStoredUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, ready, login, logout }}>
    {children}
    </AuthContext.Provider>
)
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
