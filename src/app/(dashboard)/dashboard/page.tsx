'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  SushiPageHeader,
  SushiButton,
  Button,
  Tag,
  Package,
  Warehouse,
  ArrowDown,
  ArrowUp,
  WarningCircle,
  CheckCircle,
  Database,
  ArrowRight,
  ArrowsClockwise,
} from '@/components/ui';
import {
  useDashboardKpis,
  StockReceiptModal,
  StockIssueModal,
  StockBalanceItem,
} from '@/features/inventory';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { data: kpis, isLoading, refetch } = useDashboardKpis();

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const totalProducts = kpis?.totalProducts ?? 0;
  const totalStockUnits = kpis?.totalStockUnits ?? 0;
  const lowStockCount = kpis?.lowStockCount ?? 0;
  const lowStockItems = kpis?.lowStockItems ?? [];
  const recentMovements = kpis?.recentMovements ?? [];

  return (
    <div className="space-y-6">
      {/* 1. Header Trang */}
      <SushiPageHeader
        title="Bảng Điều Khiển Quản Lý Kho"
        subtitle="Giám sát số lượng tồn kho theo thời gian thực, tự động cảnh báo hụt hàng để đặt hàng kịp thời"
        extra={
          <div className="flex items-center space-x-2">
            <Button
              icon={<ArrowsClockwise size={16} />}
              onClick={() => refetch()}
              loading={isLoading}
              className="hidden sm:inline-flex"
            >
              Làm mới
            </Button>
            <Link href="/dashboard/inventory/in">
              <SushiButton
                type="primary"
                icon={<ArrowDown size={16} weight="bold" />}
                className="bg-emerald-600 hover:bg-emerald-500 font-semibold"
              >
                Nhập Kho
              </SushiButton>
            </Link>
            <Link href="/dashboard/inventory/out">
              <SushiButton
                type="primary"
                icon={<ArrowUp size={16} weight="bold" />}
                className="bg-blue-600 hover:bg-blue-500 font-semibold"
              >
                Xuất Kho
              </SushiButton>
            </Link>
          </div>
        }
      />

      {/* 2. 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Tổng Mã Hàng Hóa */}
        <div className="p-5 rounded-2xl bg-sushi-card border border-sushi-border/90 hover:border-blue-500/40 transition-all duration-300 shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sushi-text-muted">
              Tổng Mã Hàng Hóa
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Package size={20} weight="fill" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white tracking-tight font-sans">
              {isLoading ? '...' : totalProducts}
            </span>
            <span className="text-2xs text-sushi-text-dim font-mono">
              mặt hàng
            </span>
          </div>
        </div>

        {/* Metric 2: Tổng Lượng Tồn Kho */}
        <div className="p-5 rounded-2xl bg-sushi-card border border-sushi-border/90 hover:border-emerald-500/40 transition-all duration-300 shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sushi-text-muted">
              Tổng Tồn Kho Thực Tế
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Warehouse size={20} weight="fill" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-emerald-400 tracking-tight font-mono">
              {isLoading ? '...' : totalStockUnits.toLocaleString()}
            </span>
            <span className="text-2xs text-sushi-text-dim font-mono">
              đơn vị cơ sở
            </span>
          </div>
        </div>

        {/* Metric 3: CẢNH BÁO SẮP HẾT HÀNG (< 5) */}
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
              <span>Cảnh Báo Sắp Hết Hàng (&le; 5)</span>
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
              {lowStockCount > 0 ? 'Cần đặt hàng gấp' : 'Tồn kho an toàn'}
            </span>
          </div>
        </div>

        {/* Metric 4: Trạng Thái Hệ Thống */}
        <div className="p-5 rounded-2xl bg-sushi-card border border-sushi-border/90 hover:border-blue-500/40 transition-all duration-300 shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sushi-text-muted">
              Hạ Tầng Dữ Liệu
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-700/50 border border-slate-600/40 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Database size={20} weight="fill" />
            </div>
          </div>
          <div className="mt-4 flex flex-col justify-between">
            <span className="text-sm font-semibold text-white tracking-wide truncate">
              Kho Tổng Logistics
            </span>
            <span className="text-2xs text-emerald-400 font-mono mt-1 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Neon Cloud · Postgres Online</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Phần Trung Tâm: Danh sách Cảnh Báo Sắp Hết Hàng & Biến Động Nhập Xuất */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Danh Sách Cần Đặt Hàng Gấp */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-sushi-card border border-sushi-border shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <WarningCircle size={18} weight="bold" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-sans">
                    Mặt Hàng Sắp Hết Cần Nhập Thêm
                  </h3>
                  <p className="text-xs text-sushi-text-muted">
                    Các mặt hàng có số tồn &le; 5 hoặc &le; định mức tối thiểu
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/inventory"
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-sushi-surface/40 border border-sushi-border/60">
                <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Tất cả mặt hàng đều đủ tồn kho an toàn</p>
                <p className="text-xs text-sushi-text-dim mt-1">Không có sản phẩm nào chạm ngưỡng cảnh báo (&le; 5)</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-sushi-surface border border-sushi-border flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-white truncate font-sans">
                          {item.name}
                        </span>
                        <Tag
                          color={item.quantity <= 0 ? 'red' : 'gold'}
                          className="text-2xs font-mono font-bold"
                        >
                          {item.quantity <= 0 ? 'HẾT HÀNG' : 'SẮP HẾT'}
                        </Tag>
                      </div>
                      <div className="text-2xs text-sushi-text-dim font-mono mt-0.5">
                        SKU: {item.sku} · Định mức tối thiểu: {item.minStock}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right font-mono">
                        <div
                          className={`text-base font-extrabold ${
                            item.quantity <= 0 ? 'text-rose-500' : 'text-amber-400'
                          }`}
                        >
                          Tồn: {item.quantity}
                        </div>
                      </div>

                      <Link href={`/dashboard/inventory/in`}>
                        <Button
                          size="small"
                          icon={<ArrowDown size={14} />}
                          className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border-emerald-500/30 text-xs"
                        >
                          Nhập ngay
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-sushi-border/80 flex items-center justify-between text-2xs text-sushi-text-dim">
            <span>💡 Mẹo: Nhập hàng ngay khi có cảnh báo để không bị hụt hàng khi khách đặt đơn.</span>
          </div>
        </div>

        {/* Right Column: Biến Động Nhập Xuất Gần Nhất */}
        <div className="p-6 rounded-3xl bg-sushi-card border border-sushi-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white font-sans flex items-center space-x-2">
                <span>Nhật Ký Xuất Nhập Gần Đây</span>
              </h3>
              <Link
                href="/dashboard/inventory"
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Sổ cái
              </Link>
            </div>

            {recentMovements.length === 0 ? (
              <div className="p-8 text-center text-xs text-sushi-text-dim">
                Chưa có phát sinh nhập xuất nào gần đây
              </div>
            ) : (
              <div className="space-y-3">
                {recentMovements.slice(0, 5).map((m) => {
                  const isIn = m.type === 'IN';
                  return (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-sushi-surface/60 border border-sushi-border/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isIn
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-blue-500/15 text-blue-400'
                          }`}
                        >
                          {isIn ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate">
                            {m.productName}
                          </div>
                          <div className="text-2xs text-sushi-text-dim font-mono">
                            {m.code || 'CHỨNG TỪ'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono shrink-0 pl-2">
                        <div
                          className={`font-bold ${
                            isIn ? 'text-emerald-400' : 'text-blue-400'
                          }`}
                        >
                          {isIn ? '+' : '-'}{m.quantity} {m.unit}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-sushi-border/80">
            <Link href="/dashboard/inventory/in" className="block w-full">
              <Button block className="h-10 text-xs font-semibold bg-sushi-surface hover:bg-slate-700 border-sushi-border">
                + Tạo Chứng Từ Nhập Kho Mới
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
