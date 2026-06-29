import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import pt from './locales/pt.json'

export const SUPPORTED_LANGUAGES = ['en', 'pt'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]

// Read the language saved by PrefsContext (same localStorage key) so the very
// first render is already in the right language.
function initialLanguage(): Language {
  try {
    const saved = JSON.parse(localStorage.getItem('stc_prefs') ?? '{}')?.language
    if (SUPPORTED_LANGUAGES.includes(saved)) return saved
  } catch { /* ignore */ }
  return 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pt: { translation: pt },
  },
  lng: initialLanguage(),
  fallbackLng: 'en',        // missing key/language → fall back to English
  interpolation: { escapeValue: false }, // React already escapes
})

export default i18n
