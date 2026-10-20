import React from 'react';
import {
  ChartBar,
  Package,
  SquaresFour,
  ArrowDown,
  ArrowUp,
  Warehouse,
} from '@/components/ui';
import { TranslationKey } from '@/lib/i18n';

export interface NavItem {
  key: string;
  path: string;
  labelKey: TranslationKey;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  }>;
  badge?: {
    text?: string;
    count?: number;
    color?: string;
  };
  exact?: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    key: 'overview',
    path: '/dashboard',
    labelKey: 'dashboard.overview',
    icon: ChartBar,
    exact: true,
  },
  {
    key: 'inventory',
    path: '/dashboard/inventory',
    labelKey: 'dashboard.menuInventory',
    icon: Warehouse,
  },
  {
    key: 'inbound',
    path: '/dashboard/inventory/in',
    labelKey: 'dashboard.orders', // Or custom title
    icon: ArrowDown,
  },
  {
    key: 'outbound',
    path: '/dashboard/inventory/out',
    labelKey: 'dashboard.orderSystemStatus',
    icon: ArrowUp,
  },
  {
    key: 'products',
    path: '/dashboard/products',
    labelKey: 'dashboard.menuProducts',
    icon: Package,
  },
  {
    key: 'categories',
    path: '/dashboard/categories',
    labelKey: 'dashboard.menuCategories',
    icon: SquaresFour,
  },
] as const;

/**
 * Tự động tìm key đang active từ đường dẫn hiện tại
 */
export function getActiveNavKey(pathname: string): string {
  const sorted = [...NAV_ITEMS].sort((a, b) => b.path.length - a.path.length);

  for (const item of sorted) {
    if (item.exact) {
      if (pathname === item.path) return item.key;
    } else {
      if (pathname.startsWith(item.path)) return item.key;
    }
  }

  return 'overview';
}
