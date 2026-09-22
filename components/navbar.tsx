'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import '@/lib/i18n'; // Initialize i18next
import { useTranslation } from 'react-i18next';
import { switchLanguage } from '@/lib/i18n';
import {
  TbShoppingCart,
  TbPackage,
  TbNotebook,
  TbHistory,
  TbLogout,
  TbBuildingStore,
  TbSparkles,
  TbLanguage,
} from 'react-icons/tb';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { t, i18n } = useTranslation();

  if (pathname === '/login') {
    return null;
  }

  const currentLang = (i18n.language || 'fr').startsWith('ar') ? 'ar' : 'fr';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: t('nav.pos'), href: '/caisse', icon: TbShoppingCart },
    { name: t('nav.stock'), href: '/stock', icon: TbPackage },
    { name: t('nav.carnet'), href: '/carnet', icon: TbNotebook },
    { name: t('nav.history'), href: '/historique', icon: TbHistory },
  ];

  return (
    <>
      {/* Desktop Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          {/* Brand Logo */}
          <Link href="/caisse" className="flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 transition-transform duration-200 group-hover:scale-105">
              <TbBuildingStore className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-neutral-900 font-sans">
                  maktaba
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700 border border-emerald-200/60">
                  <TbSparkles className="h-2.5 w-2.5" />
                  POS
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium -mt-0.5">
                {t('nav.storeSubtitle')}
              </p>
            </div>
          </Link>

          {/* Center Navigation Capsule */}
          <nav className="hidden md:flex items-center">
            <div className="flex items-center rounded-full border border-neutral-200/90 bg-white p-1.5 shadow-sm hover:shadow-md transition-shadow duration-200">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Right Controls: Language Switcher & User Logout */}
          <div className="flex items-center gap-2.5">
            {/* AIRBNB LANGUAGE SWITCHER PILL [ FR | عربي ] */}
            <div className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50/80 p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => switchLanguage('fr')}
                className={`rounded-full px-2.5 py-1 text-xs font-black transition-all cursor-pointer ${
                  currentLang === 'fr'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => switchLanguage('ar')}
                className={`rounded-full px-2.5 py-1 text-xs font-black transition-all cursor-pointer ${
                  currentLang === 'ar'
                    ? 'bg-white text-emerald-700 shadow-xs font-sans'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                عربي
              </button>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              title={t('nav.logout')}
              className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white p-2 pl-3 hover:border-neutral-300 hover:shadow-xs transition-all duration-200 cursor-pointer text-neutral-600 hover:text-rose-600"
            >
              <span className="text-xs font-bold hidden sm:inline">{t('nav.logout')}</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 group-hover:bg-rose-50 group-hover:text-rose-600">
                <TbLogout className="h-3.5 w-3.5" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur-lg md:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-1 flex-col items-center justify-center py-1 transition-all"
              >
                <div
                  className={`flex h-8 w-12 items-center justify-center rounded-full transition-all ${
                    isActive ? 'bg-emerald-50 text-emerald-600' : 'text-neutral-400'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-600 stroke-[2.2]' : 'text-neutral-400'}`} />
                </div>
                <span
                  className={`text-[10px] transition-colors ${
                    isActive ? 'font-bold text-emerald-700' : 'font-medium text-neutral-500'
                  }`}
                >
                  {item.name}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-600" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}