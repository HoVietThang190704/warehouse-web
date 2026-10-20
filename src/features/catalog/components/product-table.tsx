'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Table,
  Tag,
  Typography,
  Package,
  PencilSimple,
  Eye,
  Tooltip,
} from '@/components/ui';
import { Product } from '../types';
import { useTranslation } from '@/lib/i18n';
import { useFormatCurrency } from '@/lib/hooks/use-format-currency';
import { APP_ROUTES } from '@/config/navigation.config';

const { Text } = Typography;

interface ProductTableProps {
  products: Product[];
  loading?: boolean;
  onEdit?: (product: Product) => void;
}

export function ProductTable({ products, loading, onEdit }: ProductTableProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatCurrency();

  const columns = [
    {
      title: 'Ảnh',
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
      title: 'Tên hàng & Mã SKU',
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
                <span>Mã vạch: {record.barcode}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Nhóm hàng',
      key: 'category',
      width: 170,
      render: (_: unknown, record: Product) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-sushi-surface border border-sushi-border text-sushi-text-muted">
          {record.category?.name || 'Chưa phân loại'}
        </span>
      ),
    },
    {
      title: 'Đơn vị',
      key: 'unit',
      width: 90,
      render: (_: unknown, record: Product) => (
        <span className="text-xs font-mono font-medium text-slate-300">
          {record.baseUnit?.name || 'Cái'}
        </span>
      ),
    },
    {
      title: 'Ngưỡng cảnh báo',
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
      title: 'Giá vốn',
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
      title: 'Giá bán',
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
      title: 'Trạng thái',
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
          <span>{isActive ? 'Hoạt động' : 'Tạm ngừng'}</span>
        </span>
      ),
    },
    {
      title: 'Thao tác',
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
  );
}
