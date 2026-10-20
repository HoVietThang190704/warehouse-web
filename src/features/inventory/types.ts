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

export interface StockReceiptResult {
  success: boolean;
  documentCode: string;
  productId: string;
  productName: string;
  quantityAdded: number;
  newBalance: number;
}

export interface StockIssueResult {
  success: boolean;
  documentCode: string;
  productId: string;
  productName: string;
  quantityIssued: number;
  newBalance: number;
  isLowStock?: boolean;
  warning?: string | null;
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
    performerName?: string;
    createdAt: string;
  }>;
}

export type StockDocumentType =
  | 'PURCHASE_RECEIPT'
  | 'MANUAL_IN'
  | 'MANUAL_OUT'
  | 'SALES_ISSUE'
  | 'OPENING_BALANCE'
  | 'ADJUSTMENT';

export interface StockDocumentDetailItem {
  id: string;
  productId: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  product?: {
    name: string;
    sku: string;
    baseUnit?: {
      name: string;
    };
  };
}

export interface StockDocumentItem {
  id: string;
  code: string;
  type: StockDocumentType;
  status: string;
  note?: string | null;
  warehouseId: string;
  createdBy?: string | null;
  creatorName: string;
  postedBy?: string | null;
  posterName: string;
  createdAt: string;
  postedAt?: string | null;
  totalQuantity: number;
  totalAmount: number;
  items: StockDocumentDetailItem[];
}
