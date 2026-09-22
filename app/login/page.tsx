'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import { switchLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  TbBuildingStore,
  TbLock,
  TbMail,
  TbLoader2,
  TbAlertCircle,
  TbEye,
  TbEyeOff,
  TbSparkles,
  TbShieldCheck,
} from 'react-icons/tb';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t, i18n } = useTranslation();

  const currentLang = (i18n.language || 'fr').startsWith('ar') ? 'ar' : 'fr';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? t('login.invalidCredentials')
          : signInError.message
      );
      setLoading(false);
      return;
    }

    // Refresh cookies and navigate to Caisse
    router.push('/caisse');
    router.refresh();
  };

  const handleLanguageChange = (lang: 'fr' | 'ar') => {
    switchLanguage(lang);
    router.refresh();
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* ======================================================== */}
        {/* TOP BAR: BRAND LOGO + LANGUAGE SWITCHER                  */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <TbBuildingStore className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-neutral-900 font-sans">
                maktaba
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700 border border-emerald-200/60 shadow-2xs">
                <TbSparkles className="h-2.5 w-2.5" />
                POS
              </span>
            </div>
          </div>

          {/* Airbnb Language Switcher Pill [ FR | عربي ] */}
          <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => handleLanguageChange('fr')}
              className={`rounded-full px-3 py-1 text-xs font-black transition-all cursor-pointer ${
                currentLang === 'fr'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('ar')}
              className={`rounded-full px-3 py-1 text-xs font-black transition-all cursor-pointer font-sans ${
                currentLang === 'ar'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              عربي
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* AIRBNB ROUNDED-3XL LOGIN CARD                            */}
        {/* ======================================================== */}
        <div className="rounded-[32px] border border-neutral-200/90 bg-white p-7 sm:p-9 shadow-xl shadow-neutral-900/5 transition-all">
          <div className="mb-6 space-y-1">
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">
              {t('login.submitBtn')}
            </h2>
            <p className="text-xs text-neutral-400 font-medium">
              {t('login.subtitle')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50/80 p-3.5 text-xs font-bold text-rose-800 border border-rose-200/80 animate-in fade-in duration-200">
                <TbAlertCircle className="h-4 w-4 text-rose-600 shrink-0 stroke-[2.5]" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-neutral-700">
                {t('login.emailLabel')}
              </Label>
              <div className="relative">
                <TbMail className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 stroke-[2.2]" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="gerant@maktaba.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ps-10 h-11 bg-white rounded-2xl border-neutral-200 text-xs font-medium focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600 transition-all"
                />
              </div>
            </div>

            {/* Password Input with Eye Toggle */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-neutral-700">
                {t('login.passwordLabel')}
              </Label>
              <div className="relative">
                <TbLock className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 stroke-[2.2]" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ps-10 pe-10 h-11 bg-white rounded-2xl border-neutral-200 text-xs font-medium focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer p-1"
                >
                  {showPassword ? (
                    <TbEyeOff className="h-4 w-4 stroke-[2]" />
                  ) : (
                    <TbEye className="h-4 w-4 stroke-[2]" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md shadow-emerald-600/25 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <TbLoader2 className="mr-2 h-4 w-4 animate-spin stroke-[2.5]" />
                  {t('login.connecting')}
                </>
              ) : (
                t('login.submitBtn')
              )}
            </Button>
          </form>
        </div>

        {/* Trust Badge Footer */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 font-medium">
          <TbShieldCheck className="h-4 w-4 text-emerald-600 stroke-[2]" />
          <span>{t('login.secureAccess')}</span>
        </div>
      </div>
    </div>
  );
}