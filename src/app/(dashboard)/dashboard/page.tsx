'use client';

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
} from '@/components/ui';
import {
  useDashboardKpis,
} from '@/features/inventory';
import { APP_ROUTES } from '@/config/navigation.config';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { data: kpis, isLoading, refetch } = useDashboardKpis();

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
              <span>Cảnh Báo Cần Nhập Hàng</span>
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
                    Mặt Hàng Cần Nhập Thêm
                  </h3>
                  <p className="hidden sm:block text-xs text-sushi-text-muted truncate">
                    Hàng chưa nhập kho, đã hết hoặc chạm định mức tối thiểu
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/inventory"
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1 shrink-0 whitespace-nowrap"
              >
                <span>Xem tất cả</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-sushi-surface/40 border border-sushi-border/60">
                <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Tất cả mặt hàng đều đủ tồn kho an toàn</p>
                <p className="text-xs text-sushi-text-dim mt-1">Không có mặt hàng nào cần nhập thêm</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-sushi-surface border border-sushi-border flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                  >
                    {/* Khối bên trái: Tên hàng nổi bật & Badge Tồn kho */}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={APP_ROUTES.PRODUCT_DETAIL(item.id)}
                        className="block font-bold text-white text-[15px] sm:text-base leading-snug font-sans line-clamp-2 break-words hover:text-blue-400 transition-colors text-pretty"
                      >
                        {item.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1.5 font-mono">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold tabular-nums border ${
                            item.quantity <= 0
                              ? 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                              : 'bg-amber-500/10 border-amber-500/25 text-amber-300 motion-safe:animate-pulse'
                          }`}
                        >
                          Tồn: {item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Khối bên phải: Nút Nhập ngay */}
                    <Link href="/dashboard/inventory/in" className="shrink-0">
                      <Button
                        size="small"
                        icon={<ArrowDown size={14} />}
                        className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border-emerald-500/30 text-xs font-semibold h-8.5 px-3 flex items-center justify-center gap-1"
                      >
                        Nhập ngay
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-sushi-border/80 flex items-center gap-1.5 text-2xs text-sushi-text-dim">
            <Info size={13} className="text-sushi-text-muted shrink-0" />
            <span>Mẹo: Nhập hàng ngay khi có cảnh báo để không bị hụt hàng khi khách đặt đơn.</span>
          </div>
        </div>

        {/* Right Column: Biến Động Nhập Xuất Gần Nhất */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-sushi-card border border-sushi-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white font-sans flex items-center space-x-2">
                <span>Nhật Ký Xuất Nhập Gần Đây</span>
              </h3>
              <Link
                href="/dashboard/inventory?tab=history"
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Lịch sử xuất nhập
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
                          <div className="text-2xs text-sushi-text-dim font-mono flex items-center gap-1.5 flex-wrap">
                            <span>{m.code || 'CHỨNG TỪ'}</span>
                            {formattedDate && (
                              <>
                                <span>·</span>
                                <span className="text-slate-300">{formattedDate}</span>
                              </>
                            )}
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
        </div>
      </div>
    </div>
  );
}
