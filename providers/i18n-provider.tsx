'use client';

import { useEffect } from 'react';
import i18n from '@/lib/i18n';
import { I18nextProvider } from 'react-i18next';

export default function I18nProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: string;
}) {
  // Sync i18n language with the server cookie
  if (i18n.language !== initialLang) {
    i18n.changeLanguage(initialLang);
  }

  useEffect(() => {
    document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = initialLang;
  }, [initialLang]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}