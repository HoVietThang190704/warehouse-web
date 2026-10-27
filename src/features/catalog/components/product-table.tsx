'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Table,
  Package,
  PencilSimple,
  Eye,
  Pagination,
} from '@/components/ui';
import { Product } from '../types';
import { useFormatCurrency } from '@/lib/hooks/use-format-currency';
import { APP_ROUTES } from '@/config/navigation.config';
import { useTranslation } from '@/lib/i18n';

interface ProductTableProps {
  products: Product[];
  loading?: boolean;
  onEdit?: (product: Product) => void;
}

export function ProductTable({ products, loading, onEdit }: ProductTableProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatCurrency();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Lấy danh sách sản phẩm phân trang cho mobile
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, currentPage, pageSize]);

  const columns = [
    {
      title: t('products.tableImage'),
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 76,
      render: (url: string | null | undefined, record: Product) => (
        <Link
          href={APP_ROUTES.PRODUCT_DETAIL(record.id)}
          className="w-11 h-11 rounded-xl overflow-hidden border border-sushi-border bg-sushi-surface flex items-center justify-center shrink-0 shadow-sm hover:border-blue-500 transition-colors"
        >
          {url ? (
            <Image
              src={url}
              alt={record.name}
              width={44}
              height={44}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <Package size={20} className="text-sushi-text-dim" />
          )}
        </Link>
      ),
    },
    {
      title: t('products.tableNameSku'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Product) => (
        <div className="py-1">
          <Link
            href={APP_ROUTES.PRODUCT_DETAIL(record.id)}
            className="text-white hover:text-blue-400 font-semibold block text-sm font-sans transition-colors"
          >
            {name}
          </Link>
          <div className="flex items-center space-x-2 text-2xs text-sushi-text-dim font-mono mt-0.5">
            <span className="text-blue-400 font-semibold">SKU: {record.sku}</span>
            {record.barcode && (
              <>
                <span>·</span>
                <span>{t('products.barcodePrefix')} {record.barcode}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      title: t('products.tableCategory'),
      key: 'category',
      width: 170,
      render: (_: unknown, record: Product) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-sushi-surface border border-sushi-border text-sushi-text-muted">
          {record.category?.name || t('common.uncategorized')}
        </span>
      ),
    },
    {
      title: t('products.tableUnit'),
      key: 'unit',
      width: 90,
      render: (_: unknown, record: Product) => (
        <span className="text-xs font-mono font-medium text-slate-300">
          {record.baseUnit?.name || t('products.unitDefault')}
        </span>
      ),
    },
    {
      title: t('products.tableMinStock'),
      dataIndex: 'minStock',
      key: 'minStock',
      width: 130,
      render: (min: number | string) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-amber-500/10 border border-amber-500/25 text-amber-400">
          &le; {Number(min || 5)}
        </span>
      ),
    },
    {
      title: t('products.tableCostPrice'),
      dataIndex: 'costPrice',
      key: 'costPrice',
      width: 130,
      render: (price: number | string) => (
        <span className="text-sushi-text-muted font-mono text-xs">
          {formatCurrency(price || 0)}
        </span>
      ),
    },
    {
      title: t('products.tableSellingPrice'),
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      width: 130,
      render: (price: number | string) => (
        <span className="text-sushi-text font-bold font-sans text-sm">
          {formatCurrency(price || 0)}
        </span>
      ),
    },
    {
      title: t('products.tableStatus'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive: boolean) => (
        <span
          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isActive
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : 'bg-zinc-500/10 border-zinc-500/25 text-zinc-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? 'bg-emerald-500' : 'bg-zinc-500'
            }`}
          />
          <span>{isActive ? t('common.active') : t('common.inactive')}</span>
        </span>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 110,
      align: 'right' as const,
      render: (_: unknown, record: Product) => (
        <div className="flex items-center justify-end space-x-1">
          <Link
            href={APP_ROUTES.PRODUCT_DETAIL(record.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sushi-text-muted hover:text-white hover:bg-sushi-surface transition-colors border border-transparent hover:border-sushi-border"
            aria-label="Xem chi tiết"
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </Link>

          <button
            type="button"
            onClick={() => onEdit?.(record)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sushi-text-muted hover:text-white hover:bg-sushi-surface transition-colors cursor-pointer border border-transparent hover:border-sushi-border"
            aria-label="Chỉnh sửa"
            title="Chỉnh sửa"
          >
            <PencilSimple size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border border-sushi-border overflow-hidden bg-sushi-card shadow-sm">
      {/* 1. Mobile Cards: Hiển thị trên màn hình nhỏ (sm:hidden) */}
      <div className="block sm:hidden p-3 space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-sushi-text-dim">
            Đang tải danh mục hàng hóa...
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-xs text-sushi-text-dim">
            Chưa có hàng hóa nào được tạo
          </div>
        ) : (
          <>
            {paginatedProducts.map((prod) => (
              <div
                key={prod.id}
                className="p-3.5 rounded-xl bg-sushi-surface/70 border border-sushi-border/90 space-y-3 shadow-sm"
              >
                {/* Header: Ảnh, Tên, SKU, Barcode & Trạng thái */}
                <div className="flex items-start gap-3">
                  <Link
                    href={APP_ROUTES.PRODUCT_DETAIL(prod.id)}
                    className="size-12 rounded-xl overflow-hidden border border-sushi-border bg-sushi-surface flex items-center justify-center shrink-0 shadow-sm hover:border-blue-500 transition-colors"
                  >
                    {prod.imageUrl ? (
                      <Image
                        src={prod.imageUrl}
                        alt={prod.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <Package size={22} className="text-sushi-text-dim" />
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={APP_ROUTES.PRODUCT_DETAIL(prod.id)}
                      className="block font-bold text-white text-[15px] leading-snug font-sans line-clamp-2 break-words hover:text-blue-400 transition-colors text-pretty"
                    >
                      {prod.name}
                    </Link>

                    <div className="flex items-center space-x-1.5 text-2xs text-sushi-text-dim font-mono mt-1">
                      <span className="text-blue-400 font-medium">SKU: {prod.sku}</span>
                      {prod.category?.name && (
                        <>
                          <span className="text-sushi-border">·</span>
                          <span className="truncate text-slate-400">{prod.category.name}</span>
                        </>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-2xs font-medium border ${
                          prod.isActive
                            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                            : 'bg-zinc-500/10 border-zinc-500/25 text-zinc-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            prod.isActive ? 'bg-emerald-500' : 'bg-zinc-500'
                          }`}
                        />
                        <span>{prod.isActive ? 'Hoạt động' : 'Tạm ngừng'}</span>
                      </span>

                      <span className="text-2xs font-mono text-slate-400 bg-sushi-surface px-1.5 py-0.5 rounded border border-sushi-border/60">
                        ĐVT: {prod.baseUnit?.name || 'Cái'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thông tin Giá vốn, Giá bán & Định mức */}
                <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-lg bg-sushi-surface/90 border border-sushi-border/60 font-mono">
                  <div>
                    <span className="text-sushi-text-dim text-2xs block">Giá vốn:</span>
                    <span className="text-slate-300 font-semibold">{formatCurrency(prod.costPrice)}</span>
                  </div>
                  <div>
                    <span className="text-sushi-text-dim text-2xs block">Giá bán:</span>
                    <span className="text-emerald-400 font-semibold">{formatCurrency(prod.sellingPrice)}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-sushi-border/40 flex items-center justify-between text-2xs text-sushi-text-dim">
                    <span>Định mức cảnh báo:</span>
                    <span className="text-amber-300 font-semibold">&le; {prod.minStock ?? 5} {prod.baseUnit?.name || 'Cái'}</span>
                  </div>
                </div>

                {/* Hai nút hành động trên mobile: Xem chi tiết & Sửa */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={APP_ROUTES.PRODUCT_DETAIL(prod.id)}
                    className="h-9 rounded-lg bg-blue-600/15 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye size={15} />
                    <span>Chi tiết</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => onEdit?.(prod)}
                    className="h-9 rounded-lg bg-sushi-surface hover:bg-sushi-card-hover text-slate-200 border border-sushi-border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PencilSimple size={15} />
                    <span>Chỉnh sửa</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Phân trang Mobile */}
            {products.length > pageSize && (
              <div className="pt-2 pb-1 flex justify-center">
                <Pagination
                  size="small"
                  current={currentPage}
                  pageSize={pageSize}
                  total={products.length}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  className="sushi-pagination-mobile !text-xs"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* 2. Desktop Table: Hiển thị trên màn hình vừa và lớn (hidden sm:block) */}
      <div className="hidden sm:block">
        <Table
          dataSource={products}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            className: 'px-4 py-2 select-none',
          }}
          scroll={{ x: 900 }}
        />
      </div>
    </div>
  );
}
