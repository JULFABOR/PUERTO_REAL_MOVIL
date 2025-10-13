import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import en from './locales/en.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'es', // default language
  fallbackLng: 'es',
  resources: {
    es: {
      translation: es,
    },
    en: {
      translation: en,
    },
  },
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

export default i18n;
