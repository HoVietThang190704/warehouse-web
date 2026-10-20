'use client';

import React from 'react';
import Image from 'next/image';
import {
  Table,
  Tag,
  Typography,
  Package,
  Tooltip,
  Button,
  WarningCircle,
  CheckCircle,
  ArrowDown,
  ArrowUp,
} from '@/components/ui';
import { StockBalanceItem } from '../types';
import { useFormatCurrency } from '@/lib/hooks/use-format-currency';

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
  const { formatCurrency } = useFormatCurrency();

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'productImage',
      key: 'productImage',
      width: 76,
      render: (url: string | null | undefined, record: StockBalanceItem) => (
        <div className="w-11 h-11 rounded-xl overflow-hidden border border-sushi-border bg-sushi-surface flex items-center justify-center shrink-0 shadow-sm">
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
        </div>
      ),
    },
    {
      title: 'Tên hàng hóa & SKU',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: StockBalanceItem) => (
        <div className="py-1">
          <Text strong className="text-sushi-text block text-sm font-sans">
            {name}
          </Text>
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
        const isOut = qty <= 0;
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
          &le; <strong className="text-amber-400">{min || 5}</strong>
        </span>
      ),
    },
    {
      title: 'Trạng thái tồn kho',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (_: unknown, record: StockBalanceItem) => {
        if (record.quantity <= 0) {
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
            <Tooltip title="Nhập thêm hàng vào kho">
              <Button
                size="small"
                icon={<ArrowDown size={14} />}
                onClick={() => onQuickIn(record)}
                className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border-emerald-500/30 text-xs"
              >
                Nhập
              </Button>
            </Tooltip>
          )}

          {onQuickOut && (
            <Tooltip title="Xuất kho hàng này">
              <Button
                size="small"
                icon={<ArrowUp size={14} />}
                disabled={record.quantity <= 0}
                onClick={() => onQuickOut(record)}
                className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border-blue-500/30 text-xs"
              >
                Xuất
              </Button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border border-sushi-border overflow-hidden bg-sushi-card shadow-sm">
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
  );
}
