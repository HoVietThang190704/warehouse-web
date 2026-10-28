import React from 'react';
import {
  ChartBar,
  Package,
  ArrowDown,
  ArrowUp,
  Warehouse,
  Users,
} from '@/components/ui';
import { TranslationKey } from '@/lib/i18n';
import { UserRole } from '@/types/auth';

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
  EMPLOYEES: '/dashboard/employees',
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
  allowedRoles?: readonly UserRole[];
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
    allowedRoles: ['SUPER_ADMIN', 'WAREHOUSE_MANAGER'],
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
  {
    key: 'employees',
    path: APP_ROUTES.EMPLOYEES,
    labelKey: 'dashboard.menuEmployees',
    icon: Users,
    allowedRoles: ['SUPER_ADMIN'],
  },
] as const;

/**
 * Lấy danh sách NavItem được phép truy cập theo vai trò của tài khoản
 */
export function getAllowedNavItems(role?: UserRole): readonly NavItem[] {
  if (!role) return NAV_ITEMS;
  return NAV_ITEMS.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(role),
  );
}

/**
 * Tự động tìm key đang active từ đường dẫn hiện tại
 */
export function getActiveNavKey(pathname: string, items = NAV_ITEMS): string {
  const sorted = [...items].sort((a, b) => b.path.length - a.path.length);

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
export function getNavIndex(pathname: string, items = NAV_ITEMS): number {
  const activeKey = getActiveNavKey(pathname, items);
  const index = items.findIndex((item) => item.key === activeKey);
  return index !== -1 ? index : 0;
}
