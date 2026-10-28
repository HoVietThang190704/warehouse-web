'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  SushiPageHeader,
  SushiButton,
  Button,
  ArrowDown,
  ArrowUp,
  WarningCircle,
  CheckCircle,
  ArrowRight,
  ArrowsClockwise,
  Info,
  CaretLeft,
  CaretRight,
} from '@/components/ui';
import {
  useDashboardKpis,
  useInventorySocket,
} from '@/features/inventory';
import { APP_ROUTES } from '@/config/navigation.config';
import { useTranslation } from '@/lib/i18n';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: kpis, isLoading, refetch } = useDashboardKpis();
  const [lowStockPage, setLowStockPage] = useState(1);
  const PAGE_SIZE = 5;

  // Kích hoạt kết nối realtime socket cho màn hình Dashboard tổng quan
  useInventorySocket();

  const lowStockCount = kpis?.lowStockCount ?? 0;
  const recentMovements = kpis?.recentMovements ?? [];

  // Ưu tiên hàng hết/chưa nhập (màu đỏ: quantity <= 0) lên trên trước hàng sắp hết (màu vàng: quantity > 0)
  const sortedLowStockItems = useMemo(() => {
    const items = kpis?.lowStockItems ?? [];
    return [...items].sort((a, b) => {
      const aIsZero = a.quantity <= 0 ? 0 : 1;
      const bIsZero = b.quantity <= 0 ? 0 : 1;
      if (aIsZero !== bIsZero) return aIsZero - bIsZero;
      return a.quantity - b.quantity;
    });
  }, [kpis?.lowStockItems]);

  const totalPages = Math.ceil(sortedLowStockItems.length / PAGE_SIZE) || 1;
  const currentPage = Math.min(lowStockPage, totalPages);

  const displayedLowStockItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedLowStockItems.slice(start, start + PAGE_SIZE);
  }, [sortedLowStockItems, currentPage]);

  return (
    <div className="space-y-6">
      {/* 1. Header Trang */}
      <SushiPageHeader
        title={t('overview.title')}
        subtitle={t('overview.subtitle')}
        extra={
          <div className="flex items-center space-x-2">
            <Button
              icon={<ArrowsClockwise size={16} />}
              onClick={() => refetch()}
              loading={isLoading}
              className="hidden sm:inline-flex"
            >
              {t('overview.refresh')}
            </Button>
            <Link href="/dashboard/inventory/in">
              <SushiButton
                type="primary"
                icon={<ArrowDown size={16} weight="bold" />}
                className="bg-emerald-600 hover:bg-emerald-500 font-semibold"
              >
                {t('overview.stockIn')}
              </SushiButton>
            </Link>
            <Link href="/dashboard/inventory/out">
              <SushiButton
                type="primary"
                icon={<ArrowUp size={16} weight="bold" />}
                className="bg-blue-600 hover:bg-blue-500 font-semibold"
              >
                {t('overview.stockOut')}
              </SushiButton>
            </Link>
          </div>
        }
      />

      {/* Cảnh báo cần nhập hàng */}
      <div className="grid grid-cols-1 gap-4">
        <div
          onClick={() => router.push('/dashboard/inventory')}
          className={`p-5 rounded-2xl bg-sushi-card border transition-all duration-300 shadow-md cursor-pointer group ${
            lowStockCount > 0
              ? 'border-amber-500/60 bg-amber-950/20 hover:border-amber-400'
              : 'border-sushi-border/90 hover:border-sushi-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 flex items-center space-x-1.5">
              {lowStockCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
              <span>{t('overview.needRestockAlert')}</span>
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <WarningCircle size={22} weight="fill" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-400 tracking-tight font-mono">
              {isLoading ? '...' : lowStockCount}
            </span>
            <span className="text-2xs text-amber-300 font-mono">
              {lowStockCount > 0 ? t('overview.needOrderUrgent') : t('overview.stockSafe')}
            </span>
          </div>
        </div>

      </div>

      {/* 3. Phần Trung Tâm: Danh sách Cảnh Báo Sắp Hết Hàng & Biến Động Nhập Xuất */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Danh Sách Cần Đặt Hàng Gấp */}
        <div className="lg:col-span-2 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-sushi-card border border-sushi-border shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2.5 mb-3 sm:mb-4">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="size-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <WarningCircle size={18} weight="bold" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white font-sans truncate">
                    {t('overview.needRestockItems')}
                  </h3>
                  <p className="hidden sm:block text-xs text-sushi-text-muted truncate">
                    {t('overview.needRestockSubtitle')}
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/inventory"
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1 shrink-0 whitespace-nowrap"
              >
                <span>{t('overview.viewAll')}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {sortedLowStockItems.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-sushi-surface/40 border border-sushi-border/60">
                <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">{t('overview.allStockSafe')}</p>
                <p className="text-xs text-sushi-text-dim mt-1">{t('overview.noRestockNeeded')}</p>
              </div>
            ) : (
              <>
                <div className="space-y-2.5">
                  {displayedLowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 sm:p-3.5 rounded-xl bg-sushi-surface/90 border border-sushi-border/90 flex flex-col gap-2 hover:border-amber-500/40 transition-colors"
                    >
                      {/* Hàng 1: Tên hàng hóa chiếm trọn dòng trên - nổi bật nhất */}
                      <Link
                        href={APP_ROUTES.PRODUCT_DETAIL(item.id)}
                        className="block font-semibold !text-emerald-300 hover:!text-emerald-200 text-base leading-snug font-sans line-clamp-2 break-words transition-colors text-pretty tracking-tight"
                      >
                        {item.name}
                      </Link>

                      {/* Hàng 2: Badge Tồn kho bên trái, nút Nhập ngay chìm bên phải */}
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold tabular-nums border ${
                            item.quantity <= 0
                              ? 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                              : 'bg-amber-500/10 border-amber-500/25 text-amber-300 motion-safe:animate-pulse'
                          }`}
                        >
                          {t('overview.stock')}: {item.quantity}
                        </span>

                        <Link href="/dashboard/inventory/in" className="shrink-0">
                          <Button
                            size="small"
                            icon={<ArrowDown size={13} className="text-slate-400" />}
                            className="!bg-slate-800/80 !text-slate-300 hover:!bg-slate-700 hover:!text-white !border-slate-700/80 text-xs font-medium h-7.5 px-2.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                          >
                            {t('overview.stockInNow')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Phân trang gọn: 5 mặt hàng/trang */}
                {sortedLowStockItems.length > PAGE_SIZE && (
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-sushi-border/80 text-xs">
                    <span className="text-2xs text-sushi-text-dim font-mono">
                      {Math.min((currentPage - 1) * PAGE_SIZE + 1, sortedLowStockItems.length)}-{Math.min(currentPage * PAGE_SIZE, sortedLowStockItems.length)} / {sortedLowStockItems.length} {t('overview.items')}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <Button
                        size="small"
                        icon={<CaretLeft size={13} />}
                        disabled={currentPage <= 1}
                        onClick={() => setLowStockPage((prev) => Math.max(1, prev - 1))}
                        className="!h-7 !w-7 !p-0 flex items-center justify-center !rounded-lg !bg-sushi-surface/80 hover:!bg-sushi-surface"
                      />
                      <span className="text-2xs font-mono text-sushi-text px-1">
                        {t('overview.pageOf')} {currentPage}/{totalPages}
                      </span>
                      <Button
                        size="small"
                        icon={<CaretRight size={13} />}
                        disabled={currentPage >= totalPages}
                        onClick={() => setLowStockPage((prev) => Math.min(totalPages, prev + 1))}
                        className="!h-7 !w-7 !p-0 flex items-center justify-center !rounded-lg !bg-sushi-surface/80 hover:!bg-sushi-surface"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="pt-3 border-t border-sushi-border/80 flex items-center gap-1.5 text-2xs text-sushi-text-dim">
            <Info size={13} className="text-sushi-text-muted shrink-0" />
            <span>{t('overview.restockTip')}</span>
          </div>
        </div>

        {/* Right Column: Biến Động Nhập Xuất Gần Nhất */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-sushi-card border border-sushi-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white font-sans flex items-center space-x-2">
                <span>{t('overview.recentMovementsTitle')}</span>
              </h3>
              <Link
                href="/dashboard/inventory?tab=history"
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                {t('overview.historyLink')}
              </Link>
            </div>

            {recentMovements.length === 0 ? (
              <div className="p-8 text-center text-xs text-sushi-text-dim">
                {t('overview.noMovementsYet')}
              </div>
            ) : (
              <div className="space-y-3">
                {recentMovements.slice(0, 5).map((m) => {
                  const isIn = m.type === 'IN';
                  const formattedDate = m.createdAt
                    ? new Date(m.createdAt).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '';

                  return (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-sushi-surface/60 border border-sushi-border/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <div
                          className={`size-7.5 rounded-lg flex items-center justify-center shrink-0 ${
                            isIn
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-blue-500/15 text-blue-400'
                          }`}
                        >
                          {isIn ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white text-[14px] sm:text-xs leading-snug line-clamp-2 sm:truncate break-words text-pretty">
                            {m.productName}
                          </div>
                          <div className="text-2xs text-sushi-text-dim font-mono flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="hidden sm:inline">{m.code || 'CHỨNG TỪ'}</span>
                            {formattedDate && (
                              <>
                                <span className="hidden sm:inline">·</span>
                                <span className="text-slate-300/90">{formattedDate}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono shrink-0 pl-2">
                        <div
                          className={`font-extrabold text-[15px] sm:text-xs tabular-nums ${
                            isIn ? 'text-emerald-400' : 'text-blue-400'
                          }`}
                        >
                          {isIn ? '+' : '-'}{m.quantity} <span className="text-2xs font-normal text-sushi-text-muted">{m.unit}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
