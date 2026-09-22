import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './translations';

export function getClientCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

export function setClientCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

if (!i18n.isInitialized) {
  const initialLang =
    typeof window !== 'undefined'
      ? getClientCookie('maktaba-lang') || localStorage.getItem('maktaba-lang') || 'fr'
      : 'fr';

  i18n.use(initReactI18next).init({
    resources,
    lng: initialLang,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });
}

export const switchLanguage = (newLang: 'fr' | 'ar') => {
  i18n.changeLanguage(newLang);
  if (typeof window !== 'undefined') {
    setClientCookie('maktaba-lang', newLang);
    localStorage.setItem('maktaba-lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  }
};

export default i18n;