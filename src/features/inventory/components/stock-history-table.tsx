'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  Tag,
  ArrowDown,
  ArrowUp,
  User,
  Receipt,
  Pagination,
} from '@/components/ui';
import { StockDocumentItem, StockDocumentType } from '../types';
import { useTranslation } from '@/lib/i18n';

interface StockHistoryTableProps {
  documents: StockDocumentItem[];
  loading?: boolean;
}

export function StockHistoryTable({ documents, loading }: StockHistoryTableProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Lấy danh sách chứng từ phân trang cho mobile
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return documents.slice(start, start + pageSize);
  }, [documents, currentPage, pageSize]);
  const getDocumentTypeMeta = (type: StockDocumentType) => {
    switch (type) {
      case 'PURCHASE_RECEIPT':
      case 'MANUAL_IN':
      case 'OPENING_BALANCE':
        return {
          label: t('inventory.typeIn'),
          color: 'green',
          isInput: true,
        };
      case 'MANUAL_OUT':
      case 'SALES_ISSUE':
        return {
          label: t('inventory.typeOut'),
          color: 'blue',
          isInput: false,
        };
      case 'ADJUSTMENT':
      default:
        return {
          label: t('inventory.typeAdjust'),
          color: 'purple',
          isInput: true,
        };
    }
  };

  const columns = [
    {
      title: t('inventory.historyTime'),
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
      title: t('inventory.historyDocCode'),
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
      title: t('inventory.historyType'),
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
      title: t('inventory.historyItems'),
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
                  {item.product?.name || t('inventory.colUnnamed')}
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
      title: t('inventory.historyQuantity'),
      key: 'totalQuantity',
      width: 130,
      render: (_: unknown, record: StockDocumentItem) => {
        const meta = getDocumentTypeMeta(record.type);
        const qty = record.totalQuantity;
        const unitName = record.items?.[0]?.product?.baseUnit?.name || t('inventory.unitsUnit');

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
      title: t('inventory.historyPerformer'),
      key: 'performer',
      width: 180,
      render: (_: unknown, record: StockDocumentItem) => {
        const performer = record.posterName || record.creatorName || t('inventory.historyUnknown');
        const isUnknown = performer === t('inventory.historyUnknown');

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

      {/* 1. Mobile Card View: Hiển thị trên màn hình nhỏ (sm:hidden) */}
      <div className="block sm:hidden p-3 space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-sushi-text-dim">
            Đang tải danh sách chứng từ...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center text-xs text-sushi-text-dim">
            Chưa có chứng từ nhập xuất nào
          </div>
        ) : (
          <>
            {paginatedDocuments.map((doc) => {
              const meta = getDocumentTypeMeta(doc.type);
              const d = new Date(doc.createdAt);
              const formattedDate = !isNaN(d.getTime())
                ? `${d.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })} ${d.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : '';
              const unitName = doc.items?.[0]?.product?.baseUnit?.name || 'đơn vị';

              return (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl bg-sushi-surface/70 border border-sushi-border/90 space-y-2.5 shadow-sm"
                >
                  {/* Header thẻ: Loại chứng từ, Mã & Số lượng */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <Tag
                        color={meta.color}
                        className="text-2xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 m-0"
                      >
                        {meta.isInput ? (
                          <ArrowDown size={12} weight="bold" />
                        ) : (
                          <ArrowUp size={12} weight="bold" />
                        )}
                        <span>{meta.label}</span>
                      </Tag>
                      <span className="font-mono text-2xs font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 truncate">
                        {doc.code}
                      </span>
                    </div>

                    <div
                      className={`font-mono text-sm font-extrabold shrink-0 ${
                        meta.isInput ? 'text-emerald-400' : 'text-blue-400'
                      }`}
                    >
                      {meta.isInput ? '+' : '-'}
                      {doc.totalQuantity} {unitName}
                    </div>
                  </div>

                  {/* Danh sách mặt hàng trong chứng từ */}
                  <div className="space-y-1 pt-1 border-t border-sushi-border/60">
                    {doc.items && doc.items.length > 0 ? (
                      doc.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-white truncate max-w-[200px]">
                            {item.product?.name || 'Hàng hóa'}
                          </span>
                          <span className="text-2xs font-mono text-sushi-text-dim shrink-0">
                            SKU: {item.product?.sku || 'N/A'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-2xs text-sushi-text-dim">Không có chi tiết</span>
                    )}
                  </div>

                  {/* Ghi chú chứng từ (nếu có) */}
                  {doc.note && (
                    <div className="text-2xs text-amber-200/90 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 italic flex items-start gap-1">
                      <span className="font-semibold not-italic text-amber-300 shrink-0">Ghi chú:</span>
                      <span className="line-clamp-2">{doc.note}</span>
                    </div>
                  )}

                  {/* Footer thẻ: Người thực hiện & Ngày giờ */}
                  <div className="pt-2 border-t border-sushi-border/40 space-y-1.5 text-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sushi-text-dim shrink-0">
                        {t('inventory.historyPerformer')}:
                      </span>
                      {(() => {
                        const performer = doc.posterName || doc.creatorName || t('inventory.historyUnknown');
                        const isUnknown = performer === t('inventory.historyUnknown');

                        return (
                          <div className="flex items-center gap-1.5 min-w-0 justify-end">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-3xs ${
                                isUnknown
                                  ? 'bg-slate-700/50 text-slate-400'
                                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              <User size={11} />
                            </div>
                            <span
                              className={`truncate font-medium ${
                                isUnknown ? 'text-sushi-text-dim italic' : 'text-slate-200'
                              }`}
                            >
                              {performer}
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex items-center justify-between font-mono text-sushi-text-dim">
                      <span>{t('inventory.historyTime')}:</span>
                      <span className="text-slate-300 font-medium">{formattedDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Phân trang Mobile */}
            {documents.length > pageSize && (
              <div className="pt-2 pb-1 flex justify-center">
                <Pagination
                  size="small"
                  current={currentPage}
                  pageSize={pageSize}
                  total={documents.length}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  className="sushi-pagination-mobile !text-xs"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* 2. Desktop Table View: Hiển thị trên màn hình vừa và lớn (hidden sm:block) */}
      <div className="hidden sm:block">
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
    </div>
  );
}
