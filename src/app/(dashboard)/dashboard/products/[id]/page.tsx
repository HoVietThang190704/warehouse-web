'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  SushiPageHeader,
  SushiButton,
  Button,
  Tag,
  Typography,
  Package,
  ArrowLeft,
  PencilSimple,
  ArrowDown,
  ArrowUp,
  WarningCircle,
  Warehouse,
  Spin,
  Alert,
} from '@/components/ui';
import {
  useProduct,
  useUpdateProduct,
  EditProductModal,
} from '@/features/catalog';
import {
  StockReceiptModal,
  StockIssueModal,
} from '@/features/inventory';
import { useFormatCurrency } from '@/lib/hooks/use-format-currency';
import { APP_ROUTES } from '@/config/navigation.config';

const { Text } = Typography;

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { formatCurrency } = useFormatCurrency();

  const { data: product, isLoading, error } = useProduct(id);
  const updateProductMutation = useUpdateProduct();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Spin size="large" />
        <span className="text-xs text-sushi-text-dim font-mono">
          Đang tải thông tin hàng hóa...
        </span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <Link href={APP_ROUTES.PRODUCTS}>
          <Button icon={<ArrowLeft size={16} />}>Quay lại danh mục</Button>
        </Link>
        <Alert
          type="error"
          message="Không tìm thấy hàng hóa"
          description="Hàng hóa không tồn tại hoặc đã bị ngừng hoạt động."
          showIcon
        />
      </div>
    );
  }

  const totalStock = (product.stockBalances || []).reduce(
    (sum, b) => sum + Number(b.quantity || 0),
    0,
  );
  const minStock = Number(product.minStock ?? 5);
  const isLowStock = totalStock <= minStock;

  return (
    <div className="space-y-6">
      {/* Header */}
      <SushiPageHeader
        title={product.name}
        subtitle={`SKU: ${product.sku} · Chi tiết hàng hóa, định mức an toàn và tồn kho theo từng kho`}
        extra={
          <div className="flex flex-wrap items-center gap-2">
            <Link href={APP_ROUTES.PRODUCTS}>
              <Button icon={<ArrowLeft size={16} />}>Quay lại</Button>
            </Link>

            <SushiButton
              type="primary"
              icon={<PencilSimple size={16} />}
              onClick={() => setIsEditModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 font-semibold"
            >
              Chỉnh Sửa
            </SushiButton>

            <Button
              icon={<ArrowDown size={16} className="text-emerald-400" />}
              onClick={() => setReceiptModalOpen(true)}
              className="bg-emerald-600/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30"
            >
              Nhập kho
            </Button>

            <Button
              icon={<ArrowUp size={16} className="text-blue-400" />}
              onClick={() => setIssueModalOpen(true)}
              className="bg-blue-600/15 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
            >
              Xuất kho
            </Button>
          </div>
        }
      />

      {/* Grid: Thông tin chính & Tồn kho */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Ảnh & Thẻ tổng quan */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-sushi-card border border-sushi-border shadow-sm flex flex-col items-center text-center">
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden bg-sushi-surface border border-sushi-border flex items-center justify-center shadow-inner mb-4">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <Package size={56} className="text-sushi-text-dim" />
              )}
            </div>

            <h2 className="text-lg font-bold text-white font-sans">{product.name}</h2>
            <div className="font-mono text-xs text-blue-400 font-semibold mt-1">
              SKU: {product.sku}
            </div>
            {product.barcode && (
              <div className="font-mono text-2xs text-sushi-text-dim mt-0.5">
                Mã vạch: {product.barcode}
              </div>
            )}

            <div className="mt-4 flex items-center gap-2">
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                  product.isActive
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                    : 'bg-zinc-500/10 border-zinc-500/25 text-zinc-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    product.isActive ? 'bg-emerald-500' : 'bg-zinc-500'
                  }`}
                />
                <span>{product.isActive ? 'Đang hoạt động' : 'Tạm ngừng kinh doanh'}</span>
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="p-5 rounded-3xl bg-sushi-card border border-sushi-border shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-sushi-text-muted">Tổng lượng tồn:</span>
              <span className="font-mono text-base font-bold text-white">
                {totalStock} {product.baseUnit?.name || 'đơn vị'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-sushi-text-muted">Định mức an toàn:</span>
              <span className="font-mono text-xs font-semibold text-amber-400">
                &le; {minStock} {product.baseUnit?.name || 'đơn vị'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-sushi-text-muted">Trạng thái tồn:</span>
              {isLowStock ? (
                <Tag color="red" className="text-2xs font-mono font-bold">
                  {totalStock <= 0 ? 'HẾT HÀNG' : 'SẮP HẾT'}
                </Tag>
              ) : (
                <Tag color="green" className="text-2xs font-mono font-bold">
                  ĐỦ TỒN
                </Tag>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: Thông số chi tiết & Sổ tồn theo kho */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thuộc tính cơ bản */}
          <div className="p-6 rounded-3xl bg-sushi-card border border-sushi-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white font-sans border-b border-sushi-border/80 pb-3">
              Thông Số Cơ Bản & Định Giá
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-sushi-text-muted block">Nhóm hàng:</span>
                {product.category ? (
                  <Link
                    href={APP_ROUTES.CATEGORY_DETAIL(product.category.id)}
                    className="font-semibold text-blue-400 hover:text-blue-300 mt-1 inline-block"
                  >
                    {product.category.name} &rarr;
                  </Link>
                ) : (
                  <span className="text-sushi-text-dim mt-1 block">Chưa phân loại</span>
                )}
              </div>

              <div>
                <span className="text-sushi-text-muted block">Đơn vị tính cơ sở:</span>
                <span className="font-semibold text-white font-mono mt-1 block">
                  {product.baseUnit?.name || 'Cái'} ({product.baseUnit?.code || 'N/A'})
                </span>
              </div>

              <div>
                <span className="text-sushi-text-muted block">Giá vốn ước tính:</span>
                <span className="font-mono text-sm font-semibold text-slate-300 mt-1 block">
                  {formatCurrency(Number(product.costPrice || 0))}
                </span>
              </div>

              <div>
                <span className="text-sushi-text-muted block">Giá bán niêm yết:</span>
                <span className="font-mono text-sm font-bold text-emerald-400 mt-1 block">
                  {formatCurrency(Number(product.sellingPrice || 0))}
                </span>
              </div>

              <div>
                <span className="text-sushi-text-muted block">Ngày tạo:</span>
                <span className="font-mono text-sushi-text-dim mt-1 block">
                  {new Date(product.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>

              <div>
                <span className="text-sushi-text-muted block">Cập nhật lần cuối:</span>
                <span className="font-mono text-sushi-text-dim mt-1 block">
                  {new Date(product.updatedAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>
          </div>

          {/* Bảng tồn kho theo từng kho */}
          <div className="p-6 rounded-3xl bg-sushi-card border border-sushi-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-sushi-border/80 pb-3">
              <div className="flex items-center space-x-2">
                <Warehouse size={18} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-sans">
                  Số Dư Tồn Kho Theo Từng Kho
                </h3>
              </div>
              <Link
                href={APP_ROUTES.INVENTORY}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Xem sổ kho đầy đủ &rarr;
              </Link>
            </div>

            {product.stockBalances && product.stockBalances.length > 0 ? (
              <div className="space-y-3">
                {product.stockBalances.map((b) => {
                  const qty = Number(b.quantity || 0);
                  const isStockLow = qty <= minStock;

                  return (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-2xl bg-sushi-surface border border-sushi-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                          <Warehouse size={16} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-white block truncate">
                            {b.warehouse?.name || 'Kho hàng'}
                          </span>
                          <span className="text-2xs text-sushi-text-dim font-mono block">
                            Định mức tối thiểu: {minStock} {product.baseUnit?.name || 'đơn vị'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0">
                        <span
                          className={`font-mono text-sm font-bold ${
                            qty <= 0
                              ? 'text-rose-500'
                              : isStockLow
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {qty} {product.baseUnit?.name || 'đơn vị'}
                        </span>
                        <Tag
                          color={qty <= 0 ? 'red' : isStockLow ? 'gold' : 'green'}
                          className="text-2xs font-mono font-bold"
                        >
                          {qty <= 0 ? 'HẾT HÀNG' : isStockLow ? 'SẮP HẾT' : 'KHẢ DỤNG'}
                        </Tag>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-sushi-text-dim">
                Chưa có dữ liệu tồn kho tại bất kỳ kho nào.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Sửa Hàng Hóa */}
      <EditProductModal
        open={isEditModalOpen}
        product={product}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async (prodId, dto) => {
          await updateProductMutation.mutateAsync({ id: prodId, dto });
        }}
      />

      {/* Modals Nhập/Xuất kho nhanh */}
      <StockReceiptModal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        preselectedItem={{
          id: product.id,
          warehouseId: '',
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          unitName: product.baseUnit?.name || 'Cái',
          quantity: totalStock,
          minStock,
          averageUnitCost: Number(product.costPrice || 0),
          status: isLowStock ? 'LOW_STOCK' : 'HEALTHY',
          isLowStock,
          updatedAt: product.updatedAt,
        }}
      />

      <StockIssueModal
        open={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        preselectedItem={{
          id: product.id,
          warehouseId: '',
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          unitName: product.baseUnit?.name || 'Cái',
          quantity: totalStock,
          minStock,
          averageUnitCost: Number(product.costPrice || 0),
          status: isLowStock ? 'LOW_STOCK' : 'HEALTHY',
          isLowStock,
          updatedAt: product.updatedAt,
        }}
      />
    </div>
  );
}
