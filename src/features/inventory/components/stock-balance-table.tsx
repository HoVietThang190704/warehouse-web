'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Table,
  Typography,
  Package,
  Button,
  Pagination,
  WarningCircle,
  CheckCircle,
  ArrowDown,
  ArrowUp,
} from '@/components/ui';
import { StockBalanceItem } from '../types';
import { APP_ROUTES } from '@/config/navigation.config';

const { Text } = Typography;

interface StockBalanceTableProps {
  balances: StockBalanceItem[];
  loading?: boolean;
  onQuickIn?: (item: StockBalanceItem) => void;
  onQuickOut?: (item: StockBalanceItem) => void;
}

export function StockBalanceTable({
  balances,
  loading,
  onQuickIn,
  onQuickOut,
}: StockBalanceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Lấy dữ liệu phân trang cho mobile
  const paginatedBalances = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return balances.slice(start, start + pageSize);
  }, [balances, currentPage, pageSize]);
  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'productImage',
      key: 'productImage',
      width: 76,
      render: (url: string | null | undefined, record: StockBalanceItem) => (
        <Link
          href={APP_ROUTES.PRODUCT_DETAIL(record.productId)}
          className="w-11 h-11 rounded-xl overflow-hidden border border-sushi-border bg-sushi-surface flex items-center justify-center shrink-0 shadow-sm hover:border-blue-500 transition-colors"
        >
          {url ? (
            <Image
              src={url}
              alt={record.productName}
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
      title: 'Tên hàng hóa & SKU',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: StockBalanceItem) => (
        <div className="py-1">
          <Link
            href={APP_ROUTES.PRODUCT_DETAIL(record.productId)}
            className="text-white hover:text-blue-400 font-semibold block text-sm font-sans transition-colors"
          >
            {name}
          </Link>
          <div className="flex items-center space-x-2 text-2xs text-sushi-text-dim font-mono mt-0.5">
            <span className="text-blue-400 font-semibold">SKU: {record.productSku}</span>
            {record.productBarcode && (
              <>
                <span>·</span>
                <span>Barcode: {record.productBarcode}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Nhóm hàng',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 160,
      render: (category: string) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-sushi-surface border border-sushi-border text-sushi-text-muted">
          {category || 'Chưa phân loại'}
        </span>
      ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unitName',
      key: 'unitName',
      width: 90,
      render: (unit: string) => (
        <span className="text-xs font-mono font-medium text-slate-300">
          {unit || 'Cái'}
        </span>
      ),
    },
    {
      title: 'Số lượng tồn kho',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 160,
      render: (qty: number, record: StockBalanceItem) => {
        const isLow = record.isLowStock;
        const isOut = record.status === 'OUT_OF_STOCK';
        return (
          <div className="flex items-center space-x-2">
            <span
              className={`text-base font-extrabold font-mono ${
                isOut
                  ? 'text-rose-500'
                  : isLow
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {qty}
            </span>
            <span className="text-2xs text-sushi-text-dim font-mono">
              {record.unitName}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Ngưỡng cảnh báo',
      dataIndex: 'minStock',
      key: 'minStock',
      width: 140,
      render: (min: number) => (
        <span className="text-xs font-mono text-slate-400">
          &le; <strong className="text-amber-400">{min}</strong>
        </span>
      ),
    },
    {
      title: 'Trạng thái tồn kho',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (_: unknown, record: StockBalanceItem) => {
        if (record.status === 'NOT_RECEIVED') {
          return (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-300">
              <WarningCircle size={14} />
              <span>Chưa nhập kho</span>
            </span>
          );
        }

        if (record.status === 'OUT_OF_STOCK') {
          return (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Hết hàng (0)</span>
            </span>
          );
        }

        if (record.isLowStock) {
          return (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-sm animate-pulse">
              <WarningCircle size={14} className="text-amber-400 shrink-0" />
              <span>Sắp hết (Còn {record.quantity})</span>
            </span>
          );
        }

        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle size={14} className="text-emerald-400 shrink-0" />
            <span>Đủ hàng</span>
          </span>
        );
      },
    },
    {
      title: 'Thao tác nhanh',
      key: 'actions',
      width: 170,
      align: 'right' as const,
      render: (_: unknown, record: StockBalanceItem) => (
        <div className="flex items-center justify-end space-x-2">
          {onQuickIn && (
            <Button
              size="small"
              icon={<ArrowDown size={14} />}
              onClick={() => onQuickIn(record)}
              className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border-emerald-500/30 text-xs"
              title="Nhập thêm hàng vào kho"
            >
              Nhập
            </Button>
          )}

          {onQuickOut && (
            <Button
              size="small"
              icon={<ArrowUp size={14} />}
              disabled={record.quantity <= 0}
              onClick={() => onQuickOut(record)}
              className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border-blue-500/30 text-xs"
              title="Xuất kho hàng này"
            >
              Xuất
            </Button>
          )}
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
            Đang tải sổ tồn kho...
          </div>
        ) : balances.length === 0 ? (
          <div className="p-8 text-center text-xs text-sushi-text-dim">
            Chưa có mặt hàng nào trong sổ tồn
          </div>
        ) : (
          <>
            {paginatedBalances.map((item) => {
              const isOut = item.quantity <= 0;
              const isLow = item.isLowStock;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-sushi-surface/70 border border-sushi-border/90 space-y-3 shadow-sm"
                >
                  {/* Header: Ảnh, Tên, SKU & Trạng thái */}
                  <div className="flex items-start gap-3">
                    <Link
                      href={APP_ROUTES.PRODUCT_DETAIL(item.productId)}
                      className="size-12 rounded-xl overflow-hidden border border-sushi-border bg-sushi-surface flex items-center justify-center shrink-0 shadow-sm hover:border-blue-500 transition-colors"
                    >
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
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
                        href={APP_ROUTES.PRODUCT_DETAIL(item.productId)}
                        className="block font-bold text-white text-[15px] leading-snug font-sans line-clamp-2 break-words hover:text-blue-400 transition-colors text-pretty"
                      >
                        {item.productName}
                      </Link>

                      <div className="flex items-center space-x-1.5 text-2xs text-sushi-text-dim font-mono mt-1">
                        <span className="text-blue-400 font-medium">SKU: {item.productSku}</span>
                        {item.categoryName && (
                          <>
                            <span className="text-sushi-border">·</span>
                            <span className="truncate text-slate-400">{item.categoryName}</span>
                          </>
                        )}
                      </div>

                      <div className="mt-2">
                        {item.status === 'NOT_RECEIVED' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-300">
                            <WarningCircle size={12} />
                            <span>Chưa nhập kho</span>
                          </span>
                        ) : item.status === 'OUT_OF_STOCK' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            <span>Hết hàng (0)</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-300">
                            <WarningCircle size={12} className="text-amber-400 shrink-0" />
                            <span>Sắp hết (Còn {item.quantity})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-2xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                            <span>Đủ hàng</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Thông số tồn & Ngưỡng an toàn */}
                  <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-sushi-surface/90 border border-sushi-border/60 font-mono">
                    <div>
                      <span className="text-sushi-text-dim text-2xs block">Tồn hiện tại:</span>
                      <span
                        className={`text-base font-extrabold ${
                          isOut ? 'text-rose-500' : isLow ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {item.quantity} <span className="text-xs font-normal text-sushi-text-muted">{item.unitName}</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sushi-text-dim text-2xs block">Định mức tối thiểu:</span>
                      <span className="text-xs text-slate-300 font-medium">
                        &le; <strong className="text-amber-400 font-bold">{item.minStock}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Thao tác Nhập / Xuất nhanh trên mobile */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {onQuickIn && (
                      <Button
                        size="middle"
                        icon={<ArrowDown size={15} />}
                        onClick={() => onQuickIn(item)}
                        className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border-emerald-500/30 text-xs font-semibold w-full h-9 flex items-center justify-center gap-1"
                      >
                        Nhập kho
                      </Button>
                    )}

                    {onQuickOut && (
                      <Button
                        size="middle"
                        icon={<ArrowUp size={15} />}
                        disabled={item.quantity <= 0}
                        onClick={() => onQuickOut(item)}
                        className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border-blue-500/30 text-xs font-semibold w-full h-9 flex items-center justify-center gap-1"
                      >
                        Xuất kho
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Phân trang Mobile */}
            {balances.length > pageSize && (
              <div className="pt-2 pb-1 flex justify-center">
                <Pagination
                  size="small"
                  current={currentPage}
                  pageSize={pageSize}
                  total={balances.length}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  className="sushi-pagination-mobile !text-xs"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* 2. Desktop Table: Hiển thị trên máy tính (hidden sm:block) */}
      <div className="hidden sm:block">
        <Table
          dataSource={balances}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            className: 'px-4 py-2 select-none',
          }}
          scroll={{ x: 950 }}
        />
      </div>
    </div>
  );
}
