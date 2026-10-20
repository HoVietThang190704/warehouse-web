'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../api/catalog.api';
import { Product, CreateProductInput, UpdateProductInput } from '../types';
import { catalogKeys } from './use-categories';
import { message } from '@/components/ui';

/**
 * Hook lấy danh sách món ăn với Caching tự động (TanStack Query v5)
 */
export function useProducts(categoryId?: string) {
  return useQuery({
    queryKey: catalogKeys.products(categoryId),
    queryFn: () => catalogApi.getProducts(categoryId),
  });
}

/**
 * Hook lấy chi tiết 1 mặt hàng theo ID
 */
export function useProduct(id?: string) {
  return useQuery({
    queryKey: catalogKeys.productDetail(id || ''),
    queryFn: () => catalogApi.getProductById(id || ''),
    enabled: Boolean(id),
  });
}

/**
 * Hook tạo món ăn mới với tự động làm mới Cache
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateProductInput) => catalogApi.createProduct(dto),
    onSuccess: (newProduct: Product) => {
      // Làm mới toàn bộ cache liên quan tới catalog
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      message.success(`Thêm hàng hóa "${newProduct.name}" thành công!`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể tạo hàng hóa';
      message.error(msg);
    },
  });
}

/**
 * Hook cập nhật hàng hóa
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductInput }) =>
      catalogApi.updateProduct(id, dto),
    onSuccess: (updated: Product) => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      message.success(`Cập nhật hàng hóa "${updated.name}" thành công!`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Cập nhật hàng hóa thất bại';
      message.error(msg);
    },
  });
}
