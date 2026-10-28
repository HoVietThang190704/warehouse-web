'use client';

import React from 'react';
import Link from 'next/link';
import { Button, ShieldCheck, ArrowLeft } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { APP_ROUTES } from '@/config/navigation.config';

export function UnauthorizedCard() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[420px] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full p-8 rounded-3xl bg-sushi-card border border-sushi-border shadow-xl text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-5">
          <ShieldCheck size={36} weight="duotone" />
        </div>
        <h2 className="text-xl font-bold text-sushi-text mb-2">
          {t('employees.unauthorizedTitle')}
        </h2>
        <p className="text-sushi-text-muted text-sm leading-relaxed mb-6">
          {t('employees.unauthorizedDesc')}
        </p>
        <Link href={APP_ROUTES.DASHBOARD}>
          <Button
            type="primary"
            icon={<ArrowLeft size={16} />}
            className="rounded-xl h-10 px-5 font-medium bg-sushi-primary hover:bg-sushi-primary-hover border-none"
          >
            {t('employees.backToDashboard')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
