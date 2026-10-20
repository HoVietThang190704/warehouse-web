'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory.api';
import { StockReceiptInput, StockIssueInput } from '../types';
import { message } from '@/components/ui';

export const inventoryKeys = {
  all: ['inventory'] as const,
  balances: (params?: { warehouseId?: string; lowStockOnly?: boolean; search?: string }) =>
    [...inventoryKeys.all, 'balances', params] as const,
  warehouses: () => [...inventoryKeys.all, 'warehouses'] as const,
  kpis: (warehouseId?: string) => [...inventoryKeys.all, 'kpis', warehouseId] as const,
  documents: (warehouseId?: string) => [...inventoryKeys.all, 'documents', warehouseId] as const,
};

export function useStockBalances(params?: {
  warehouseId?: string;
  lowStockOnly?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: inventoryKeys.balances(params),
    queryFn: () => inventoryApi.getBalances(params),
    refetchInterval: 10000, // Cập nhật lại sau 10s cho live demo
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
    refetchInterval: 10000,
  });
}

export function useRecordReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: StockReceiptInput) => inventoryApi.recordReceipt(dto),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      message.success(`Nhập kho thành công! Mặt hàng "${data.productName}" đã tăng lên ${data.newBalance}`);
    },
    onError: (err: any) => {
      message.error(err?.message || 'Nhập kho thất bại');
    },
  });
}

export function useRecordIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: StockIssueInput) => inventoryApi.recordIssue(dto),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      message.success(`Xuất kho thành công! Mặt hàng "${data.productName}" còn lại ${data.newBalance}`);
      if (data.warning) {
        message.warning(data.warning);
      }
    },
    onError: (err: any) => {
      message.error(err?.message || 'Xuất kho thất bại');
    },
  });
}
