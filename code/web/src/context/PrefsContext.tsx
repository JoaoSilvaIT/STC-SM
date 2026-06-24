import { createContext, useContext, useState, useEffect } from 'react'

interface Prefs {
  clockFormat:  '12h' | '24h'
  compactMode:  boolean
  theme:        'dark' | 'light'
}

interface PrefsState extends Prefs {
  setClockFormat: (fmt: '12h' | '24h') => void
  setCompactMode: (on: boolean) => void
  setTheme:       (t: 'dark' | 'light') => void
}

const PREFS_KEY = 'stc_prefs'
const defaults: Prefs = { clockFormat: '24h', compactMode: false, theme: 'dark' }

const PrefsContext = createContext<PrefsState | null>(null)

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(() => {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') } }
    catch { return defaults }
  })

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    document.body.classList.toggle('compact', prefs.compactMode)
    document.documentElement.setAttribute('data-theme', prefs.theme)
  }, [prefs])

  const setClockFormat = (clockFormat: '12h' | '24h') => setPrefs(p => ({ ...p, clockFormat }))
  const setCompactMode = (compactMode: boolean)        => setPrefs(p => ({ ...p, compactMode }))
  const setTheme       = (theme: 'dark' | 'light')     => setPrefs(p => ({ ...p, theme }))

  return (
    <PrefsContext.Provider value={{ ...prefs, setClockFormat, setCompactMode, setTheme }}>
      {children}
    </PrefsContext.Provider>
  )
}

export function usePrefs() {
  const ctx = useContext(PrefsContext)
  if (!ctx) throw new Error('usePrefs must be used inside PrefsProvider')
  return ctx
}
