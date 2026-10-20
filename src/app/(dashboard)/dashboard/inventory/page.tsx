'use client';

import React, { useState, useMemo } from 'react';
import {
  SushiButton,
  SushiPageHeader,
  Input,
  Switch,
  MagnifyingGlass,
  ArrowDown,
  ArrowUp,
  WarningCircle,
} from '@/components/ui';
import {
  StockBalanceTable,
  StockReceiptModal,
  StockIssueModal,
  useStockBalances,
  StockBalanceItem,
} from '@/features/inventory';

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockBalanceItem | null>(null);

  const { data: balances = [], isLoading } = useStockBalances({
    lowStockOnly,
    search,
  });

  // Calculate quick summary metrics
  const totalStockUnits = useMemo(() => {
    return balances.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [balances]);

  const lowStockCount = useMemo(() => {
    return balances.filter((item) => item.isLowStock).length;
  }, [balances]);

  const handleQuickIn = (item: StockBalanceItem) => {
    setSelectedItem(item);
    setReceiptModalOpen(true);
  };

  const handleQuickOut = (item: StockBalanceItem) => {
    setSelectedItem(item);
    setIssueModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <SushiPageHeader
        title="Sổ Theo Dõi Tồn Kho"
        subtitle="Giám sát số lượng tồn kho theo thời gian thực, cảnh báo hụt hàng và thao tác xuất nhập"
        extra={
          <div className="flex items-center space-x-2.5">
            <SushiButton
              type="primary"
              icon={<ArrowDown size={16} weight="bold" />}
              onClick={() => {
                setSelectedItem(null);
                setReceiptModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 font-semibold"
            >
              Nhập Kho
            </SushiButton>
            <SushiButton
              type="primary"
              icon={<ArrowUp size={16} weight="bold" />}
              onClick={() => {
                setSelectedItem(null);
                setIssueModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-500 font-semibold"
            >
              Xuất Kho
            </SushiButton>
          </div>
        }
      />

      {/* Filter and Quick Stats Toolbar */}
      <div className="p-4 rounded-2xl bg-sushi-card border border-sushi-border flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto flex-1">
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

          {/* Toggle Lọc hàng sắp hết */}
          <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-sushi-surface border border-sushi-border self-start sm:self-auto cursor-pointer">
            <Switch
              checked={lowStockOnly}
              onChange={setLowStockOnly}
              className={lowStockOnly ? 'bg-amber-500' : ''}
            />
            <span
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className="text-xs font-semibold text-sushi-text select-none flex items-center space-x-1.5"
            >
              <WarningCircle size={15} className="text-amber-400" />
              <span>Chỉ hiện hàng sắp hết (&le; 5)</span>
            </span>
          </div>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center space-x-4 text-xs font-mono self-end md:self-auto">
          <div>
            Tổng tồn: <strong className="text-white text-sm">{totalStockUnits}</strong> đơn vị
          </div>
          {lowStockCount > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold flex items-center space-x-1 animate-pulse">
              <span>⚠️ Cần nhập:</span>
              <span className="text-sm">{lowStockCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Table Sổ Tồn Kho */}
      <StockBalanceTable
        balances={balances}
        loading={isLoading}
        onQuickIn={handleQuickIn}
        onQuickOut={handleQuickOut}
      />

      {/* Modals */}
      <StockReceiptModal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        preselectedItem={selectedItem}
      />

      <StockIssueModal
        open={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        preselectedItem={selectedItem}
      />
    </div>
  );
}
