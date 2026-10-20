'use client';

import React from 'react';
import {
  Table,
  Tag,
  Typography,
  Tooltip,
  ArrowDown,
  ArrowUp,
  User,
  Receipt,
} from '@/components/ui';
import { StockDocumentItem, StockDocumentType } from '../types';

const { Text } = Typography;

interface StockHistoryTableProps {
  documents: StockDocumentItem[];
  loading?: boolean;
}

export function StockHistoryTable({ documents, loading }: StockHistoryTableProps) {
  const getDocumentTypeMeta = (type: StockDocumentType) => {
    switch (type) {
      case 'PURCHASE_RECEIPT':
      case 'MANUAL_IN':
      case 'OPENING_BALANCE':
        return {
          label: 'Nhập kho',
          color: 'green',
          isInput: true,
        };
      case 'MANUAL_OUT':
      case 'SALES_ISSUE':
        return {
          label: 'Xuất kho',
          color: 'blue',
          isInput: false,
        };
      case 'ADJUSTMENT':
      default:
        return {
          label: 'Điều chỉnh',
          color: 'purple',
          isInput: true,
        };
    }
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (dateStr: string) => {
        const d = new Date(dateStr);
        return (
          <div className="font-mono text-xs">
            <div className="text-white font-medium">
              {d.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </div>
            <div className="text-2xs text-sushi-text-dim">
              {d.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Mã chứng từ',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (code: string) => (
        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
          {code}
        </span>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (type: StockDocumentType) => {
        const meta = getDocumentTypeMeta(type);
        return (
          <Tag
            color={meta.color}
            className="text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 w-fit"
          >
            {meta.isInput ? (
              <ArrowDown size={13} weight="bold" />
            ) : (
              <ArrowUp size={13} weight="bold" />
            )}
            <span>{meta.label}</span>
          </Tag>
        );
      },
    },
    {
      title: 'Mặt hàng & Chi tiết',
      key: 'items',
      render: (_: unknown, record: StockDocumentItem) => {
        if (!record.items || record.items.length === 0) {
          return <span className="text-xs text-sushi-text-dim">—</span>;
        }

        return (
          <div className="space-y-1 py-1">
            {record.items.map((item) => (
              <div key={item.id} className="text-xs flex items-center justify-between gap-2">
                <span className="font-medium text-white truncate max-w-xs">
                  {item.product?.name || 'Hàng hóa'}
                </span>
                <span className="text-2xs font-mono text-sushi-text-dim shrink-0">
                  (SKU: {item.product?.sku || 'N/A'})
                </span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Số lượng',
      key: 'totalQuantity',
      width: 130,
      render: (_: unknown, record: StockDocumentItem) => {
        const meta = getDocumentTypeMeta(record.type);
        const qty = record.totalQuantity;
        const unitName = record.items?.[0]?.product?.baseUnit?.name || 'đơn vị';

        return (
          <div
            className={`font-mono text-sm font-bold ${
              meta.isInput ? 'text-emerald-400' : 'text-blue-400'
            }`}
          >
            {meta.isInput ? '+' : '-'}
            {qty} {unitName}
          </div>
        );
      },
    },
    {
      title: 'Người thực hiện',
      key: 'performer',
      width: 180,
      render: (_: unknown, record: StockDocumentItem) => {
        const performer = record.posterName || record.creatorName || 'Không xác định';
        const isUnknown = performer === 'Không xác định';

        return (
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                isUnknown
                  ? 'bg-slate-700/50 text-slate-400'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
              }`}
            >
              <User size={14} />
            </div>
            <div className="min-w-0">
              <span
                className={`text-xs block truncate ${
                  isUnknown ? 'text-sushi-text-dim italic' : 'text-slate-200 font-medium'
                }`}
              >
                {performer}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 180,
      render: (note: string | null) => (
        <span className="text-xs text-sushi-text-dim line-clamp-2" title={note || ''}>
          {note || '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border border-sushi-border bg-sushi-card overflow-hidden shadow-sm">
      <div className="p-4 border-b border-sushi-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Receipt size={18} className="text-blue-400" />
          <h3 className="text-sm font-bold text-white font-sans">
            Lịch Sử Nhập / Xuất Hàng
          </h3>
          <span className="text-2xs font-mono text-sushi-text-dim px-2 py-0.5 rounded-full bg-sushi-surface border border-sushi-border">
            {documents.length} chứng từ
          </span>
        </div>
      </div>

      <Table
        dataSource={documents}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          className: 'px-4 py-2 !text-xs',
        }}
        scroll={{ x: 900 }}
        className="sushi-table"
      />
    </div>
  );
}
