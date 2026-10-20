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
  useProducts,
  useCreateProduct,
  useCategoryOptions,
} from '@/features/catalog';
import { useTranslation } from '@/lib/i18n';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TanStack Query Hooks
  const { options: categoryOptions } = useCategoryOptions();
  const { data: products = [], isLoading } = useProducts(selectedCategoryId);
  const createProductMutation = useCreateProduct();

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
        title="Danh Mục Hàng Hóa"
        subtitle="Quản lý toàn bộ danh sách hàng hóa trong kho, mã vạch và định mức tồn kho tối thiểu"
        extra={
          <SushiButton
            type="primary"
            icon={<Plus size={16} weight="bold" />}
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 font-semibold"
          >
            Thêm Hàng Hóa Mới
          </SushiButton>
        }
      />

      {/* Toolbar Tìm Kiếm & Bộ Lọc Đa Năng */}
      <div className="p-4 rounded-2xl bg-sushi-card border border-sushi-border flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto flex-1">
          {/* Ô Tìm kiếm */}
          <div className="w-full sm:w-80">
            <Input
              prefix={<MagnifyingGlass size={16} className="text-sushi-text-dim" />}
              placeholder="Tìm theo tên hàng, mã SKU, barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              className="w-full"
            />
          </div>

          {/* Lọc theo Nhóm Hàng */}
          <div className="w-full sm:w-56">
            <Select
              placeholder="Tất cả nhóm hàng"
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
          Tổng cộng: <span className="text-white font-semibold">{filteredProducts.length}</span> mặt hàng
        </div>
      </div>

      {/* Bảng Dữ Liệu Sản Phẩm */}
      <ProductTable
        products={filteredProducts}
        loading={isLoading}
      />

      {/* Modal Thêm Mới Sản Phẩm */}
      <CreateProductModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (dto) => {
          await createProductMutation.mutateAsync(dto);
        }}
      />
    </div>
  );
}
