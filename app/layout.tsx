import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/navbar';
import QueryProvider from '@/providers/query-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Maktaba POS & Stock',
  description: 'Système de gestion pour Maktaba',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <QueryProvider>
          <Navbar />
          <main className="mx-auto max-w-7xl p-4 sm:p-6 pb-20 md:pb-8">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}