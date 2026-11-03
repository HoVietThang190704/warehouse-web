import { fetchApi } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import {
  StockBalanceItem,
  StockReceiptInput,
  StockIssueInput,
  StockReceiptResult,
  StockIssueResult,
  WarehouseItem,
  DashboardKpis,
  StockDocumentItem,
  StockDocumentQueryParams,
  InventoryPerformer,
} from '../types';

export const inventoryApi = {
  /**
   * Lấy danh sách số dư tồn kho (kèm cờ cảnh báo tồn thấp)
   */
  getBalances: async (params?: {
    warehouseId?: string;
    lowStockOnly?: boolean;
    search?: string;
  }): Promise<StockBalanceItem[]> => {
    const q = new URLSearchParams();
    if (params?.warehouseId) q.append('warehouseId', params.warehouseId);
    if (params?.lowStockOnly) q.append('lowStockOnly', 'true');
    if (params?.search) q.append('search', params.search);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return fetchApi<StockBalanceItem[]>(`${API_ENDPOINTS.INVENTORY.BALANCES}${queryString}`);
  },

  /**
   * Nhập kho hàng hóa
   */
  recordReceipt: async (dto: StockReceiptInput): Promise<StockReceiptResult> => {
    return fetchApi<StockReceiptResult>(API_ENDPOINTS.INVENTORY.RECEIPTS, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Xuất kho hàng hóa (Chặn xuất âm)
   */
  recordIssue: async (dto: StockIssueInput): Promise<StockIssueResult> => {
    return fetchApi<StockIssueResult>(API_ENDPOINTS.INVENTORY.ISSUES, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Lấy danh sách kho hoạt động
   */
  getWarehouses: async (): Promise<WarehouseItem[]> => {
    return fetchApi<WarehouseItem[]>(API_ENDPOINTS.INVENTORY.WAREHOUSES);
  },

  /**
   * Lấy KPIs tổng quan cho Dashboard
   */
  getDashboardKpis: async (warehouseId?: string): Promise<DashboardKpis> => {
    const q = warehouseId ? `?warehouseId=${encodeURIComponent(warehouseId)}` : '';
    return fetchApi<DashboardKpis>(`${API_ENDPOINTS.INVENTORY.KPIS}${q}`);
  },

  /**
   * Lấy lịch sử chứng từ kèm bộ lọc
   */
  getDocuments: async (params?: StockDocumentQueryParams): Promise<StockDocumentItem[]> => {
    const q = new URLSearchParams();
    if (params?.warehouseId) q.append('warehouseId', params.warehouseId);
    if (params?.startDate) q.append('startDate', params.startDate);
    if (params?.endDate) q.append('endDate', params.endDate);
    if (params?.userId) q.append('userId', params.userId);
    if (params?.type && params.type !== 'ALL') q.append('type', params.type);
    if (params?.search) q.append('search', params.search);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return fetchApi<StockDocumentItem[]>(`${API_ENDPOINTS.INVENTORY.DOCUMENTS}${queryString}`);
  },

  /**
   * Lấy danh sách nhân viên thực hiện giao dịch kho (phục vụ bộ lọc)
   */
  getPerformers: async (): Promise<InventoryPerformer[]> => {
    return fetchApi<InventoryPerformer[]>(API_ENDPOINTS.INVENTORY.PERFORMERS);
  },
};
