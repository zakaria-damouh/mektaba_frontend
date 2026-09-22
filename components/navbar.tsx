'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  ShoppingCart,
  Package,
  BookOpen,
  History,
  LogOut,
  Store,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  if (pathname === '/login') {
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Caisse', href: '/caisse', icon: ShoppingCart },
    { name: 'Stock', href: '/stock', icon: Package },
    { name: 'Carnet', href: '/carnet', icon: BookOpen },
    { name: 'Historique', href: '/historique', icon: History },
  ];

  return (
    <>
      {/* ======================================================== */}
      {/* DESKTOP AIRBNB-STYLE TOP NAVBAR                         */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          {/* 1. Brand Logo (Airbnb style: bold icon + lowercase brand) */}
          <Link href="/caisse" className="flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 transition-transform duration-200 group-hover:scale-105">
              <Store className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-neutral-900 font-sans">
                  maktaba
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700 border border-emerald-200/60">
                  <Sparkles className="h-2.5 w-2.5" />
                  POS
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium -mt-0.5">
                Système de caisse
              </p>
            </div>
          </Link>

          {/* 2. Airbnb Center Segmented Capsule */}
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

          {/* 3. Airbnb User Capsule Button (Right Side) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Live Counter Badge */}
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50/70 py-1.5 px-3.5 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-neutral-700 text-[11px]">
                Caisse Active
              </span>
            </div>

            {/* Logout Capsule */}
            <button
              type="button"
              onClick={handleLogout}
              title="Se déconnecter"
              className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white p-2 pl-3 hover:border-neutral-300 hover:shadow-sm transition-all duration-200 cursor-pointer text-neutral-600 hover:text-rose-600"
            >
              <span className="text-xs font-bold">Quitter</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 group-hover:bg-rose-50 group-hover:text-rose-600">
                <LogOut className="h-3.5 w-3.5" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MOBILE AIRBNB-STYLE BOTTOM DOCK                         */}
      {/* ======================================================== */}
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