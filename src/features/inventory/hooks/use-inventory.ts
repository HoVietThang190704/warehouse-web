'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory.api';
import {
  StockReceiptInput,
  StockIssueInput,
  StockReceiptResult,
  StockIssueResult,
  StockDocumentQueryParams,
} from '../types';
import { message } from '@/components/ui';

export const inventoryKeys = {
  all: ['inventory'] as const,
  balances: (params?: { warehouseId?: string; lowStockOnly?: boolean; search?: string }) =>
    [...inventoryKeys.all, 'balances', params] as const,
  warehouses: () => [...inventoryKeys.all, 'warehouses'] as const,
  kpis: (warehouseId?: string) => [...inventoryKeys.all, 'kpis', warehouseId] as const,
  documents: (params?: StockDocumentQueryParams) =>
    [...inventoryKeys.all, 'documents', params] as const,
  performers: () => [...inventoryKeys.all, 'performers'] as const,
};

export function useStockBalances(params?: {
  warehouseId?: string;
  lowStockOnly?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: inventoryKeys.balances(params),
    queryFn: () => inventoryApi.getBalances(params),
    refetchInterval: 60000, // Nhịp fallback 60s (thay vì 10s liên tục) vì đã có Socket realtime
  });
}

export function useWarehouses() {
  return useQuery({
    queryKey: inventoryKeys.warehouses(),
    queryFn: () => inventoryApi.getWarehouses(),
  });
}

export function useDashboardKpis(warehouseId?: string) {
  return useQuery({
    queryKey: inventoryKeys.kpis(warehouseId),
    queryFn: () => inventoryApi.getDashboardKpis(warehouseId),
    refetchInterval: 60000,
  });
}

export function useStockDocuments(params?: StockDocumentQueryParams) {
  return useQuery({
    queryKey: inventoryKeys.documents(params),
    queryFn: () => inventoryApi.getDocuments(params),
    refetchInterval: 60000,
  });
}

export function useInventoryPerformers() {
  return useQuery({
    queryKey: inventoryKeys.performers(),
    queryFn: () => inventoryApi.getPerformers(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecordReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: StockReceiptInput) => inventoryApi.recordReceipt(dto),
    onSuccess: (data: StockReceiptResult) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      message.success(`Nhập kho thành công! Mặt hàng "${data.productName}" đã tăng lên ${data.newBalance}`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Nhập kho thất bại';
      message.error(msg);
    },
  });
}

export function useRecordIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: StockIssueInput) => inventoryApi.recordIssue(dto),
    onSuccess: (data: StockIssueResult) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      message.success(`Xuất kho thành công! Mặt hàng "${data.productName}" còn lại ${data.newBalance}`);
      if (data.warning) {
        message.warning(data.warning);
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Xuất kho thất bại';
      message.error(msg);
    },
  });
}
