/**
 * Centralized API Endpoints Dictionary for Warehouse Platform
 * Single Source of Truth for all Network Contracts & Routing
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  CATALOG: {
    CATEGORIES: '/api/catalog/categories',
    CATEGORY_BY_ID: (id: string) => `/api/catalog/categories/${id}`,
    PRODUCTS: '/api/catalog/products',
    PRODUCT_BY_ID: (id: string) => `/api/catalog/products/${id}`,
    UNITS: '/api/catalog/units',
    UPLOAD: '/api/catalog/upload',
  },
  INVENTORY: {
    BALANCES: '/api/inventory/balances',
    RECEIPTS: '/api/inventory/receipts',
    ISSUES: '/api/inventory/issues',
    KPIS: '/api/inventory/kpis',
    WAREHOUSES: '/api/inventory/warehouses',
    DOCUMENTS: '/api/inventory/documents',
  },
  USERS: {
    LIST: '/api/users',
    CREATE: '/api/users',
    UPDATE: (id: string) => `/api/users/${id}`,
    STATUS: (id: string) => `/api/users/${id}/status`,
    RESET_PASSWORD: (id: string) => `/api/users/${id}/reset-password`,
  },
} as const;
