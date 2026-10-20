'use client';

import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';

export function MobileHeader() {
  const { t } = useTranslation();

  return (
    <div className="relative w-full pt-10 pb-12 px-6 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 overflow-hidden lg:hidden flex flex-col items-center text-center border-b border-slate-800">
      {/* Decorative Glow Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_0%,rgba(37,99,235,0.2),transparent)]"
      />

      {/* Brand Logo & Badge */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-blue-500/40 flex items-center justify-center bg-slate-800 shadow-2xl mb-3">
          <Image
            src="/logo.png"
            alt="Warehouse Platform Logo"
            width={56}
            height={56}
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-white font-extrabold text-base sm:text-lg tracking-wider font-sans">
          WAREHOUSE PLATFORM
        </h1>

        <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-2xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{t('brandShowcase.badge')}</span>
        </div>
      </div>
    </div>
  );
}
