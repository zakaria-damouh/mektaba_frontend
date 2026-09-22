import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './translations';

if (!i18n.isInitialized) {
  const savedLang =
    typeof window !== 'undefined'
      ? localStorage.getItem('maktaba-lang') || 'fr'
      : 'fr';

  i18n.use(initReactI18next).init({
    resources,
    lng: savedLang,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

  // Apply RTL or LTR automatically on page load
  if (typeof window !== 'undefined') {
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLang;
  }
}

// Helper function to switch language and update document direction
export const switchLanguage = (newLang: 'fr' | 'ar') => {
  i18n.changeLanguage(newLang);
  if (typeof window !== 'undefined') {
    localStorage.setItem('maktaba-lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  }
};

export default i18n;