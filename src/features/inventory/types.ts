export type StockStatus = 'HEALTHY' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface StockBalanceItem {
  id: string;
  warehouseId: string;
  warehouseName?: string;
  productId: string;
  productName: string;
  productSku: string;
  productBarcode?: string | null;
  productImage?: string | null;
  categoryName?: string;
  unitName: string;
  quantity: number;
  minStock: number;
  averageUnitCost: number;
  status: StockStatus;
  isLowStock: boolean;
  updatedAt: string;
}

export interface StockReceiptInput {
  warehouseId?: string;
  productId: string;
  quantity: number;
  unitCost?: number;
  note?: string;
}

export interface StockIssueInput {
  warehouseId?: string;
  productId: string;
  quantity: number;
  reason?: string;
  note?: string;
}

export interface WarehouseItem {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface DashboardKpis {
  totalProducts: number;
  totalStockUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockItems: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    minStock: number;
    status: StockStatus;
  }>;
  recentMovements: Array<{
    id: string;
    code?: string;
    type: 'IN' | 'OUT';
    productName: string;
    productSku: string;
    unit: string;
    quantity: number;
    createdAt: string;
  }>;
}
