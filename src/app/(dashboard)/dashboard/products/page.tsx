'use client';

import { useState, useMemo } from 'react';
import {
  SushiButton,
  Plus,
  SushiPageHeader,
  Select,
  Input,
  MagnifyingGlass,
} from '@/components/ui';
import {
  ProductTable,
  CreateProductModal,
  EditProductModal,
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useCategoryOptions,
  Product,
} from '@/features/catalog';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/features/auth';

export default function ProductsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isStaff = user?.role === 'WAREHOUSE_STAFF';

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // TanStack Query Hooks
  const { options: categoryOptions } = useCategoryOptions();
  const { data: products = [], isLoading } = useProducts(selectedCategoryId);
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  // Bộ lọc kết hợp: Từ khóa (tên, SKU, barcode)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(query);
        const matchSku = product.sku.toLowerCase().includes(query);
        const matchBarcode = product.barcode?.toLowerCase().includes(query);
        return matchName || matchSku || matchBarcode;
      }
      return true;
    });
  }, [products, search]);

  return (
    <div className="space-y-5">
      <SushiPageHeader
        title={t('products.title')}
        subtitle={t('products.subtitle')}
        extra={
          !isStaff ? (
            <SushiButton
              type="primary"
              icon={<Plus size={16} weight="bold" />}
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 font-semibold"
            >
              {t('products.addProduct')}
            </SushiButton>
          ) : undefined
        }
      />

      {/* Toolbar Tìm Kiếm & Bộ Lọc Đa Năng */}
      <div className="p-4 rounded-2xl bg-sushi-card border border-sushi-border flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto flex-1">
          {/* Ô Tìm kiếm */}
          <div className="w-full sm:w-80">
            <Input
              prefix={<MagnifyingGlass size={16} className="text-sushi-text-dim" />}
              placeholder={t('products.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              className="w-full"
            />
          </div>

          {/* Lọc theo Nhóm Hàng */}
          <div className="w-full sm:w-56">
            <Select
              placeholder={t('products.allCategories')}
              value={selectedCategoryId}
              onChange={setSelectedCategoryId}
              allowClear
              options={categoryOptions}
              className="w-full"
            />
          </div>
        </div>

        {/* Tổng số sản phẩm hiển thị */}
        <div className="text-xs text-sushi-text-muted font-mono whitespace-nowrap self-end sm:self-auto">
          {t('products.totalCount')} <span className="text-white font-semibold">{filteredProducts.length}</span> {t('products.itemsUnit')}
        </div>
      </div>

      {/* Bảng Dữ Liệu Sản Phẩm */}
      <ProductTable
        products={filteredProducts}
        loading={isLoading}
        onEdit={isStaff ? undefined : (prod) => setEditingProduct(prod)}
      />

      {/* Modal Thêm Mới & Chỉnh Sửa Sản Phẩm (Chỉ dành cho Quản lý / Admin) */}
      {!isStaff && (
        <>
          <CreateProductModal
            open={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={async (dto) => {
              await createProductMutation.mutateAsync(dto);
            }}
          />

          <EditProductModal
            open={Boolean(editingProduct)}
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSubmit={async (id, dto) => {
              await updateProductMutation.mutateAsync({ id, dto });
            }}
          />
        </>
      )}
    </div>
  );
}
