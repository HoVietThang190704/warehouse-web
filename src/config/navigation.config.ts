import React from 'react';
import {
  ChartBar,
  Package,
  ArrowDown,
  ArrowUp,
  Warehouse,
} from '@/components/ui';
import { TranslationKey } from '@/lib/i18n';

/**
 * Đường dẫn nội bộ toàn ứng dụng (Centralized App Routes)
 * Tránh hardcode URL string rải rác trong code
 */
export const APP_ROUTES = {
  DASHBOARD: '/dashboard',
  INVENTORY: '/dashboard/inventory',
  INBOUND: '/dashboard/inventory/in',
  OUTBOUND: '/dashboard/inventory/out',
  PRODUCTS: '/dashboard/products',
  PRODUCT_DETAIL: (id: string) => `/dashboard/products/${id}`,
  CATEGORIES: '/dashboard/categories',
  CATEGORY_DETAIL: (id: string) => `/dashboard/categories/${id}`,
  ORDERS: '/dashboard/orders',
} as const;

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
    path: APP_ROUTES.DASHBOARD,
    labelKey: 'dashboard.overview',
    icon: ChartBar,
    exact: true,
  },
  {
    key: 'inventory',
    path: APP_ROUTES.INVENTORY,
    labelKey: 'dashboard.menuInventory',
    icon: Warehouse,
  },
  {
    key: 'inbound',
    path: APP_ROUTES.INBOUND,
    labelKey: 'dashboard.orders',
    icon: ArrowDown,
  },
  {
    key: 'outbound',
    path: APP_ROUTES.OUTBOUND,
    labelKey: 'dashboard.orderSystemStatus',
    icon: ArrowUp,
  },
  {
    key: 'products',
    path: APP_ROUTES.PRODUCTS,
    labelKey: 'dashboard.menuProducts',
    icon: Package,
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

/**
 * Trả về index của NavItem tương ứng theo pathname (phục vụ swipe gesture mobile)
 */
export function getNavIndex(pathname: string): number {
  const activeKey = getActiveNavKey(pathname);
  const index = NAV_ITEMS.findIndex((item) => item.key === activeKey);
  return index !== -1 ? index : 0;
}
