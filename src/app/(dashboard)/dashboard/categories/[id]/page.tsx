'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  SushiPageHeader,
  SushiButton,
  Button,
  Tag,
  Typography,
  SquaresFour,
  ArrowLeft,
  PencilSimple,
  Trash,
  Popconfirm,
  Spin,
  Alert,
} from '@/components/ui';
import {
  useCategory,
  useUpdateCategory,
  useDeleteCategory,
  EditCategoryModal,
  ProductTable,
  EditProductModal,
  useUpdateProduct,
  Product,
} from '@/features/catalog';
import { APP_ROUTES } from '@/config/navigation.config';
import { useTranslation } from '@/lib/i18n';

const { Text } = Typography;

export default function CategoryDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: category, isLoading, error } = useCategory(id);
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const updateProductMutation = useUpdateProduct();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Spin size="large" />
        <span className="text-xs text-sushi-text-dim font-mono">{t('categoryDetail.loading')}</span>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="space-y-4">
        <Link href={APP_ROUTES.CATEGORIES}>
          <Button icon={<ArrowLeft size={16} />}>{t('categoryDetail.backToList')}</Button>
        </Link>
        <Alert
          type="error"
          message={t('categoryDetail.notFound')}
          description={t('categoryDetail.notFoundDesc')}
          showIcon
        />
      </div>
    );
  }

  const productCount = category._count?.products || category.products?.length || 0;
  const canDelete = productCount === 0;

  const handleDelete = async () => {
    try {
      await deleteCategoryMutation.mutateAsync(category.id);
      router.push(APP_ROUTES.CATEGORIES);
    } catch {
      // Handled in mutation hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <SushiPageHeader
        title={category.name}
        subtitle={t('categoryDetail.subtitle')}
        extra={
          <div className="flex flex-wrap items-center gap-2">
            <Link href={APP_ROUTES.CATEGORIES}>
              <Button icon={<ArrowLeft size={16} />}>{t('detail.back')}</Button>
            </Link>

            <SushiButton
              type="primary"
              icon={<PencilSimple size={16} />}
              onClick={() => setIsEditModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 font-semibold"
            >
              {t('detail.editBtn')}
            </SushiButton>

            {canDelete ? (
              <Popconfirm
                title={t('categoryDetail.deleteTitle')}
                description={`Bạn có chắc muốn xóa nhóm hàng "${category.name}"?`}
                onConfirm={handleDelete}
                okText={t('dashboard.delete')}
                cancelText={t('common.cancel')}
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<Trash size={16} />}>
                  {t('categoryDetail.deleteBtn')}
                </Button>
              </Popconfirm>
            ) : null}
          </div>
        }
      />

      {/* Info Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-sushi-card border border-sushi-border shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <SquaresFour size={24} weight="fill" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-sushi-text-muted block font-medium">Tên nhóm hàng</span>
            <span className="text-base font-bold text-white font-sans truncate block">
              {category.name}
            </span>
            <span className="text-2xs text-sushi-text-dim font-mono block mt-0.5">
              ID: {category.id}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-sushi-card border border-sushi-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-sushi-text-muted block font-medium">Quy mô hàng hóa</span>
            <div className="mt-1 flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-emerald-400 font-mono">
                {productCount}
              </span>
              <span className="text-xs text-sushi-text-dim font-mono">mặt hàng</span>
            </div>
          </div>
          <Tag color={productCount > 0 ? 'green' : 'default'} className="font-mono text-xs">
            {productCount > 0 ? 'Đang có hàng' : 'Nhóm rỗng'}
          </Tag>
        </div>

        <div className="p-5 rounded-2xl bg-sushi-card border border-sushi-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-sushi-text-muted block font-medium">Trạng thái</span>
            <div className="mt-1">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Hoạt động</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách hàng hóa thuộc nhóm */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-sans">
            Danh Sách Hàng Hóa Thuộc Nhóm ({productCount})
          </h3>
          <Link href={APP_ROUTES.PRODUCTS}>
            <Button size="small">Quản lý kho hàng</Button>
          </Link>
        </div>

        {category.products && category.products.length > 0 ? (
          <ProductTable
            products={category.products.map((p) => ({
              ...p,
              category: { id: category.id, name: category.name },
            }))}
            onEdit={(prod) => setEditingProduct(prod)}
          />
        ) : (
          <div className="p-8 rounded-2xl border border-sushi-border bg-sushi-card text-center text-xs text-sushi-text-dim">
            Chưa có mặt hàng nào thuộc nhóm này.
          </div>
        )}
      </div>

      {/* Modal Sửa Nhóm */}
      <EditCategoryModal
        open={isEditModalOpen}
        category={category}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async (catId, dto) => {
          await updateCategoryMutation.mutateAsync({ id: catId, dto });
        }}
      />

      {/* Modal Sửa Hàng Hóa con */}
      <EditProductModal
        open={Boolean(editingProduct)}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSubmit={async (prodId, dto) => {
          await updateProductMutation.mutateAsync({ id: prodId, dto });
        }}
      />
    </div>
  );
}
