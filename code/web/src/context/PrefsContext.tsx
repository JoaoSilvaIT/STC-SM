import { createContext, useContext, useState, useEffect } from 'react'
import i18n, { type Language } from '@/i18n'

interface Prefs {
  clockFormat:  '12h' | '24h'
  compactMode:  boolean
  theme:        'dark' | 'light'
  language:     Language
}

interface PrefsState extends Prefs {
  setClockFormat: (fmt: '12h' | '24h') => void
  setCompactMode: (on: boolean) => void
  setTheme:       (t: 'dark' | 'light') => void
  setLanguage:    (lng: Language) => void
}

const PREFS_KEY = 'stc_prefs'
const defaults: Prefs = { clockFormat: '24h', compactMode: false, theme: 'dark', language: 'en' }

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
    document.documentElement.setAttribute('lang', prefs.language)
    if (i18n.language !== prefs.language) i18n.changeLanguage(prefs.language)
  }, [prefs])

  const setClockFormat = (clockFormat: '12h' | '24h') => setPrefs(p => ({ ...p, clockFormat }))
  const setCompactMode = (compactMode: boolean)        => setPrefs(p => ({ ...p, compactMode }))
  const setTheme       = (theme: 'dark' | 'light')     => setPrefs(p => ({ ...p, theme }))
  const setLanguage    = (language: Language)          => setPrefs(p => ({ ...p, language }))

  return (
    <PrefsContext.Provider value={{ ...prefs, setClockFormat, setCompactMode, setTheme, setLanguage }}>
      {children}
    </PrefsContext.Provider>
  )
}

export function usePrefs() {
  const ctx = useContext(PrefsContext)
  if (!ctx) throw new Error('usePrefs must be used inside PrefsProvider')
  return ctx
}
