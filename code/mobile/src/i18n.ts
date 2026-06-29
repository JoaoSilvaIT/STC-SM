import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './locales/en.json';
import pt from './locales/pt.json';

export const SUPPORTED_LANGUAGES = ['en', 'pt'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/** The phone's language if we support it, otherwise English. */
export function deviceLanguage(): Language {
  const code = Localization.getLocales()[0]?.languageCode;
  return code === 'pt' ? 'pt' : 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pt: { translation: pt },
  },
  lng: deviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
