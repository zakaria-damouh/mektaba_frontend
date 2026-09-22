import type { Metadata } from 'next';
import { Inter, Cairo } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/navbar';
import QueryProvider from '@/providers/query-provider';
import I18nProvider from '@/providers/i18n-provider';
import { cookies } from 'next/headers';

// French / Latin Font (Airbnb Inter style)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Arabic Font (Modern Geometric Cairo)
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Maktaba POS & Stock',
  description: 'Système de gestion pour Maktaba',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const lang = cookieStore.get('maktaba-lang')?.value || 'fr';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cairo.variable} font-sans bg-neutral-50/60 text-neutral-900 antialiased`}
      >
        <QueryProvider>
          <I18nProvider initialLang={lang}>
            <Navbar />
            <main className="mx-auto max-w-7xl p-4 sm:p-6 pb-20 md:pb-8">
              {children}
            </main>
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}