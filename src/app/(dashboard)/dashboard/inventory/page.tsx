'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  SushiButton,
  SushiPageHeader,
  Input,
  Switch,
  MagnifyingGlass,
  ArrowDown,
  ArrowUp,
  WarningCircle,
  Package,
  Receipt,
  FileArrowDown,
  message,
} from '@/components/ui';
import ExcelJS from 'exceljs';
import {
  StockBalanceTable,
  StockHistoryTable,
  StockReceiptModal,
  StockIssueModal,
  useStockBalances,
  useStockDocuments,
  useInventorySocket,
  StockBalanceItem,
  inventoryApi,
} from '@/features/inventory';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/features/auth';

function InventoryContent() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isStaff = user?.role === 'WAREHOUSE_STAFF';

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: 'balance' | 'history' = tabParam === 'history' ? 'history' : 'balance';

  const setActiveTab = (tab: 'balance' | 'history') => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'history') {
      params.set('tab', 'history');
    } else {
      params.delete('tab');
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockBalanceItem | null>(null);

  // Kích hoạt kết nối realtime socket cho màn hình sổ kho
  useInventorySocket();

  const { data: balances = [], isLoading: balancesLoading } = useStockBalances({
    lowStockOnly,
    search,
  });

  const { data: documents = [], isLoading: documentsLoading } = useStockDocuments();

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

  const [exportLoading, setExportLoading] = useState(false);

  const handleExportExcel = async () => {
    try {
      setExportLoading(true);
      // Luôn lấy toàn bộ danh sách hàng hóa trong kho hiện tại (không áp dụng filter tìm kiếm hay cảnh báo)
      const allBalances = await inventoryApi.getBalances();

      if (!allBalances || allBalances.length === 0) {
        message.warning(t('inventory.exportNoData'));
        return;
      }

      // Khởi tạo workbook bằng ExcelJS để hỗ trợ định dạng tiêu đề in đậm & căn giữa
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Sushi Warehouse Platform';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet(t('inventory.exportSheetName'), {
        views: [{ showGridLines: true }],
      });

      // Thiết lập các cột đúng 3 cột theo yêu cầu
      worksheet.columns = [
        { header: t('inventory.colProductName'), key: 'productName', width: 36 },
        { header: t('inventory.colQuantity'), key: 'quantity', width: 16 },
        { header: t('inventory.colNote'), key: 'note', width: 30 },
      ];

      // Thêm toàn bộ dữ liệu hàng hóa
      allBalances.forEach((item) => {
        worksheet.addRow({
          productName: item.productName || t('inventory.colUnnamed'),
          quantity: Number(item.quantity || 0),
          note: '',
        });
      });

      // Định dạng dòng Tiêu đề (Row 1): Times New Roman, In đậm, Căn giữa cả chiều ngang và dọc
      const headerRow = worksheet.getRow(1);
      headerRow.height = 26;
      headerRow.font = {
        name: 'Times New Roman',
        size: 11,
        bold: true,
        color: { argb: 'FF000000' },
      };
      headerRow.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };

      // Căn chỉnh nội dung các dòng dữ liệu: Times New Roman, Số lượng căn phải, Tên hàng căn trái
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.height = 22;
          row.font = {
            name: 'Times New Roman',
            size: 11,
          };
          row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
          row.getCell(2).alignment = { vertical: 'middle', horizontal: 'right' };
          row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });

      // Tạo buffer và kích hoạt tải file trên trình duyệt
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      anchor.download = `bao-cao-ton-kho-${dateStr}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);

      message.success(t('inventory.exportSuccess'));
    } catch (error) {
      console.error('Lỗi xuất file Excel:', error);
      message.error(t('inventory.exportError'));
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <SushiPageHeader
        title={t('inventory.title')}
        subtitle={t('inventory.subtitle')}
        extra={
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <SushiButton
              icon={<FileArrowDown size={16} weight="bold" />}
              onClick={handleExportExcel}
              loading={exportLoading}
              className="!bg-emerald-950/40 hover:!bg-emerald-900/50 !text-emerald-400 hover:!text-emerald-300 !border-emerald-600/40 font-semibold"
            >
              {t('inventory.exportExcel')}
            </SushiButton>
            {!isStaff && (
              <SushiButton
                type="primary"
                icon={<ArrowDown size={16} weight="bold" />}
                onClick={() => {
                  setSelectedItem(null);
                  setReceiptModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 font-semibold"
              >
                {t('inventory.stockIn')}
              </SushiButton>
            )}
            <SushiButton
              type="primary"
              icon={<ArrowUp size={16} weight="bold" />}
              onClick={() => {
                setSelectedItem(null);
                setIssueModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-500 font-semibold"
            >
              {t('inventory.stockOut')}
            </SushiButton>
          </div>
        }
      />

      {/* Tabs Chuyển đổi giữa Sổ tồn và Lịch sử nhập xuất */}
      <div className="flex items-center space-x-2 border-b border-sushi-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('balance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'balance'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-sushi-card border border-sushi-border text-sushi-text-muted hover:text-white hover:bg-sushi-surface'
          }`}
        >
          <Package size={16} weight={activeTab === 'balance' ? 'fill' : 'regular'} />
          <span>{t('inventory.tabBalances')} ({balances.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-sushi-card border border-sushi-border text-sushi-text-muted hover:text-white hover:bg-sushi-surface'
          }`}
        >
          <Receipt size={16} weight={activeTab === 'history' ? 'fill' : 'regular'} />
          <span>{t('inventory.tabHistory')} ({documents.length})</span>
        </button>
      </div>

      {activeTab === 'balance' ? (
        <>
          {/* Filter and Quick Stats Toolbar */}
          <div className="p-4 rounded-2xl bg-sushi-card border border-sushi-border flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto flex-1">
              {/* Ô Tìm kiếm */}
              <div className="w-full sm:w-80">
                <Input
                  prefix={<MagnifyingGlass size={16} className="text-sushi-text-dim" />}
                  placeholder={t('inventory.searchPlaceholder')}
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
                  <span>{t('inventory.lowStockFilter')}</span>
                </span>
              </div>
            </div>

            {/* Quick Summary Pill */}
            <div className="flex items-center space-x-4 text-xs font-mono self-end md:self-auto">
              <div>
                {t('inventory.totalStockUnits')} <strong className="text-white text-sm">{totalStockUnits}</strong> {t('inventory.unitsUnit')}
              </div>
              {lowStockCount > 0 && (
                <div className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold flex items-center space-x-1.5 animate-pulse">
                  <WarningCircle size={14} className="text-amber-400 shrink-0" />
                  <span>{t('inventory.needRestockBadge')}</span>
                  <span className="text-sm">{lowStockCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Table Sổ Tồn Kho */}
          <StockBalanceTable
            balances={balances}
            loading={balancesLoading}
            onQuickIn={isStaff ? undefined : handleQuickIn}
            onQuickOut={handleQuickOut}
          />
        </>
      ) : (
        /* Table Lịch Sử Nhập / Xuất Chứng Từ */
        <StockHistoryTable
          documents={documents}
          loading={documentsLoading}
        />
      )}

      {/* Modals */}
      {!isStaff && (
        <StockReceiptModal
          open={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          preselectedItem={selectedItem}
        />
      )}

      <StockIssueModal
        open={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        preselectedItem={selectedItem}
      />
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-sushi-text-dim">
          Đang tải dữ liệu kho...
        </div>
      }
    >
      <InventoryContent />
    </Suspense>
  );
}
