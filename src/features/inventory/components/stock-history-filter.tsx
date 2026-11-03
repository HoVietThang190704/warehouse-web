'use client';

import React, { useState, useMemo } from 'react';
import {
  Input,
  DatePicker,
  Select,
  Drawer,
  MagnifyingGlass,
  CalendarBlank,
  ArrowCounterClockwise,
  Funnel,
  X,
} from '@/components/ui';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from '@/lib/i18n';
import {
  InventoryPerformer,
  StockDocumentQueryParams,
  StockDocumentFilterType,
} from '../types';

const { RangePicker } = DatePicker;

export interface StockHistoryFilterProps {
  performers: InventoryPerformer[];
  value: StockDocumentQueryParams;
  onChange: (nextParams: StockDocumentQueryParams) => void;
  onReset: () => void;
}

/**
 * Helper tính toán khoảng ngày tương ứng với từng preset
 */
export const getDatePresetRange = (presetKey: string): [Dayjs, Dayjs] | null => {
  const now = dayjs();
  switch (presetKey) {
    case 'TODAY':
      return [now.startOf('day'), now.endOf('day')];
    case '7_DAYS':
      return [now.subtract(7, 'day').startOf('day'), now.endOf('day')];
    case '30_DAYS':
      return [now.subtract(30, 'day').startOf('day'), now.endOf('day')];
    case 'THIS_MONTH':
      return [now.startOf('month'), now.endOf('month')];
    case 'THIS_YEAR':
      return [now.startOf('year'), now.endOf('year')];
    case 'LAST_YEAR':
      return [
        now.subtract(1, 'year').startOf('year'),
        now.subtract(1, 'year').endOf('year'),
      ];
    case 'ALL':
    default:
      return null;
  }
};

/**
 * Helper cập nhật an toàn ngày bắt đầu hoặc ngày kết thúc
 */
const computeDateRange = (
  current: [Dayjs, Dayjs] | null,
  newDate: Dayjs | null,
  isStart: boolean,
): [Dayjs, Dayjs] | null => {
  if (!newDate) {
    if (isStart) {
      return current?.[1] ? [current[1], current[1]] : null;
    }
    return current?.[0] ? [current[0], current[0]] : null;
  }
  const other = isStart ? current?.[1] : current?.[0];
  if (!other) {
    return [newDate, newDate];
  }
  if (isStart) {
    return newDate.isAfter(other) ? [newDate, newDate] : [newDate, other];
  } else {
    return newDate.isBefore(other) ? [newDate, newDate] : [other, newDate];
  }
};

export function StockHistoryFilter({
  performers,
  value,
  onChange,
  onReset,
}: StockHistoryFilterProps) {
  const { t } = useTranslation();

  // Active state
  const [activePreset, setActivePreset] = useState<string>('ALL');
  const [search, setSearch] = useState<string>(value.search || '');

  // Mobile Bottom Sheet Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftDateRange, setDraftDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [draftPerformerId, setDraftPerformerId] = useState<string>('');
  const [draftType, setDraftType] = useState<StockDocumentFilterType>('ALL');
  const [draftPreset, setDraftPreset] = useState<string>('ALL');

  // Helper chuyển đổi tên vai trò người dùng sang đa ngôn ngữ
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return t('common.superAdmin');
      case 'WAREHOUSE_MANAGER':
        return t('common.warehouseManager');
      case 'WAREHOUSE_STAFF':
      default:
        return t('common.warehouseStaff');
    }
  };

  // Convert current ISO startDate/endDate to Dayjs objects for desktop controls
  const activeDateRange = useMemo<[Dayjs, Dayjs] | null>(() => {
    if (value.startDate && value.endDate) {
      const s = dayjs(value.startDate);
      const e = dayjs(value.endDate);
      if (s.isValid() && e.isValid()) {
        return [s, e];
      }
    }
    return null;
  }, [value.startDate, value.endDate]);

  // Kiểm tra xem có bộ lọc nào đang kích hoạt hay không
  const isFiltered = Boolean(
    value.startDate ||
      value.endDate ||
      value.userId ||
      (value.type && value.type !== 'ALL') ||
      value.search,
  );

  // Đếm số lượng bộ lọc nâng cao đang bật (để gắn huy hiệu trên mobile)
  const advancedFiltersCount = useMemo(() => {
    let count = 0;
    if (value.startDate || value.endDate) count++;
    if (value.userId) count++;
    if (value.type && value.type !== 'ALL') count++;
    return count;
  }, [value.startDate, value.endDate, value.userId, value.type]);

  // Dải presets thời gian chuẩn
  const datePresets = [
    { key: 'ALL', label: t('inventory.filterAll') },
    { key: 'TODAY', label: t('inventory.presetToday') },
    { key: '7_DAYS', label: t('inventory.preset7Days') },
    { key: '30_DAYS', label: t('inventory.preset30Days') },
    { key: 'THIS_MONTH', label: t('inventory.presetThisMonth') },
    { key: 'THIS_YEAR', label: t('inventory.presetThisYear') },
    { key: 'LAST_YEAR', label: t('inventory.presetLastYear') },
  ];

  // Áp dụng nhanh preset ngày trên giao diện chính
  const handleApplyPreset = (key: string) => {
    setActivePreset(key);
    const range = getDatePresetRange(key);
    onChange({
      ...value,
      startDate: range ? range[0].startOf('day').toISOString() : undefined,
      endDate: range ? range[1].endOf('day').toISOString() : undefined,
    });
  };

  // Mở Bottom Sheet Drawer trên Mobile
  const handleOpenDrawer = () => {
    setDraftDateRange(activeDateRange);
    setDraftPerformerId(value.userId || '');
    setDraftType(value.type || 'ALL');
    setDraftPreset(activePreset);
    setDrawerOpen(true);
  };

  // Áp dụng bộ lọc từ Bottom Sheet
  const handleApplyDrawer = () => {
    setActivePreset(draftPreset);
    onChange({
      ...value,
      startDate: draftDateRange
        ? draftDateRange[0].startOf('day').toISOString()
        : undefined,
      endDate: draftDateRange
        ? draftDateRange[1].endOf('day').toISOString()
        : undefined,
      userId: draftPerformerId || undefined,
      type: draftType !== 'ALL' ? draftType : undefined,
    });
    setDrawerOpen(false);
  };

  // Đặt lại toàn bộ bộ lọc trong Drawer
  const handleResetDrawer = () => {
    setDraftDateRange(null);
    setDraftPerformerId('');
    setDraftType('ALL');
    setDraftPreset('ALL');
    setActivePreset('ALL');
    setSearch('');
    onReset();
    setDrawerOpen(false);
  };

  // Đặt lại bộ lọc ở giao diện ngoài
  const handleReset = () => {
    setActivePreset('ALL');
    setSearch('');
    onReset();
  };

  const performerOptions = useMemo(
    () => [
      { value: '', label: t('inventory.filterAllPerformers') },
      ...performers.map((p) => ({
        value: p.id,
        label: `${p.fullName || p.email} (${getRoleLabel(p.role)})`,
      })),
    ],
    [performers, t],
  );

  const transactionTypeOptions: { value: StockDocumentFilterType; label: string }[] = [
    { value: 'ALL', label: t('inventory.filterAllTypes') },
    { value: 'IN', label: t('inventory.typeIn') },
    { value: 'OUT', label: t('inventory.typeOut') },
  ];

  return (
    <>
      {/* 1. Desktop Toolbar (Màn hình sm: trở lên) */}
      <div className="hidden sm:block p-4 rounded-2xl bg-sushi-card border border-sushi-border space-y-3.5 shadow-sm">
        {/* Dải nút chọn nhanh thời gian */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
          <span className="text-xs font-semibold text-sushi-text-dim flex items-center gap-1.5 shrink-0 mr-1 select-none">
            <CalendarBlank size={14} className="text-blue-400" />
            <span>{t('inventory.filterTime')}:</span>
          </span>

          {datePresets.map((preset) => {
            const isActive = activePreset === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => handleApplyPreset(preset.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'bg-sushi-surface border border-sushi-border text-sushi-text-muted hover:text-white hover:bg-sushi-surface/80'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Lưới 12 cột điều khiển chính */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3 items-center">
          {/* RangePicker tự do */}
          <div className="lg:col-span-4 w-full">
            <RangePicker
              value={activeDateRange}
              onChange={(dates) => {
                setActivePreset(dates ? 'CUSTOM' : 'ALL');
                onChange({
                  ...value,
                  startDate: dates ? dates[0]!.startOf('day').toISOString() : undefined,
                  endDate: dates ? dates[1]!.endOf('day').toISOString() : undefined,
                });
              }}
              format="DD/MM/YYYY"
              placeholder={[t('inventory.filterStartDate'), t('inventory.filterEndDate')]}
              className="w-full !rounded-xl !h-9 !text-xs [&_input]:!text-xs"
              allowClear
            />
          </div>

          {/* Lọc theo Nhân viên */}
          <div className="lg:col-span-3 w-full">
            <Select
              value={value.userId || undefined}
              onChange={(val) => onChange({ ...value, userId: val || undefined })}
              placeholder={t('inventory.filterAllPerformers')}
              allowClear
              showSearch
              optionFilterProp="label"
              className="w-full !rounded-xl !text-xs [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!h-9 [&_.ant-select-selection-item]:!text-xs [&_.ant-select-selection-placeholder]:!text-xs [&_.ant-select-selection-item]:!leading-[34px] [&_.ant-select-selection-placeholder]:!leading-[34px]"
              options={performerOptions}
            />
          </div>

          {/* Lọc theo Loại phiếu */}
          <div className="lg:col-span-2 w-full">
            <Select<StockDocumentFilterType>
              value={value.type || 'ALL'}
              onChange={(val) =>
                onChange({
                  ...value,
                  type: val !== 'ALL' ? val : undefined,
                })
              }
              className="w-full !rounded-xl !text-xs [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!h-9 [&_.ant-select-selection-item]:!text-xs [&_.ant-select-selection-placeholder]:!text-xs [&_.ant-select-selection-item]:!leading-[34px] [&_.ant-select-selection-placeholder]:!leading-[34px]"
              options={transactionTypeOptions}
            />
          </div>

          {/* Tìm kiếm & Nút Reset */}
          <div className="lg:col-span-3 w-full flex items-center gap-2">
            <Input
              prefix={<MagnifyingGlass size={15} className="text-sushi-text-dim" />}
              placeholder={t('inventory.filterSearchPlaceholder')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                onChange({ ...value, search: e.target.value.trim() || undefined });
              }}
              allowClear
              className="w-full !rounded-xl !h-9 !text-xs [&_input]:!text-xs"
            />

            {isFiltered && (
              <button
                type="button"
                onClick={handleReset}
                title={t('inventory.filterReset')}
                className="h-9 px-2.5 rounded-xl bg-sushi-surface border border-sushi-border text-sushi-text-muted hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-400 transition-all cursor-pointer shrink-0 flex items-center justify-center"
              >
                <ArrowCounterClockwise size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Mobile Toolbar tinh gọn (Màn hình sm:hidden) */}
      <div className="sm:hidden p-3 rounded-2xl bg-sushi-card border border-sushi-border space-y-2.5 shadow-sm">
        {/* Hàng 1: Tìm kiếm + Nút mở Bottom Sheet + Nút Reset */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              prefix={<MagnifyingGlass size={15} className="text-sushi-text-dim" />}
              placeholder={t('inventory.filterSearchPlaceholder')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                onChange({ ...value, search: e.target.value.trim() || undefined });
              }}
              allowClear
              className="w-full !rounded-xl !h-9 !text-xs [&_input]:!text-xs"
            />
          </div>

          {/* Nút mở Bottom Sheet Drawer */}
          <button
            type="button"
            onClick={handleOpenDrawer}
            className={`px-3.5 h-9 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              advancedFiltersCount > 0
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                : 'bg-sushi-surface border-sushi-border text-sushi-text hover:text-white'
            }`}
          >
            <Funnel size={14} weight={advancedFiltersCount > 0 ? 'fill' : 'regular'} />
            <span>{t('inventory.filterBtn')}</span>
            {advancedFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-3xs flex items-center justify-center font-bold">
                {advancedFiltersCount}
              </span>
            )}
          </button>

          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              title={t('inventory.filterReset')}
              className="h-9 px-2.5 rounded-xl bg-sushi-surface border border-sushi-border text-sushi-text-muted hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-400 transition-all cursor-pointer shrink-0 flex items-center justify-center"
            >
              <ArrowCounterClockwise size={15} />
            </button>
          )}
        </div>

        {/* Hàng 2: Dải chip thời gian vuốt ngang 1 chạm */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
          {datePresets.map((preset) => {
            const isActive = activePreset === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => handleApplyPreset(preset.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'bg-sushi-surface border border-sushi-border text-sushi-text-muted hover:text-white hover:bg-sushi-surface/80'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Bottom Sheet Bộ Lọc Mobile (Ant Design Drawer chuẩn v6) */}
      <Drawer
        placement="bottom"
        closable={false}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        rootClassName="sushi-bottom-sheet"
        styles={{
          section: {
            backgroundColor: '#161922',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            borderTop: '1px solid #282c37',
          },
          body: { padding: 0 },
        }}
      >
        <div className="flex flex-col max-h-[85vh]">
          {/* Header Bottom Sheet */}
          <div className="flex items-center justify-between p-4 border-b border-sushi-border sticky top-0 bg-[#161922] z-10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white m-0">
              {t('inventory.filterDrawerTitle')}
            </h3>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 rounded-full text-sushi-text-muted hover:text-white hover:bg-sushi-surface transition-all cursor-pointer"
            >
              <X size={18} weight="bold" />
            </button>
          </div>

          {/* Nội dung form bộ lọc */}
          <div className="p-4 space-y-4 overflow-y-auto flex-1 no-scrollbar">
            {/* Khoảng thời gian */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                {t('inventory.filterTime')}
              </label>

              {/* Dải chọn nhanh preset */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
                {datePresets.map((preset) => {
                  const isActive = draftPreset === preset.key;
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => {
                        setDraftPreset(preset.key);
                        setDraftDateRange(getDatePresetRange(preset.key));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm font-semibold'
                          : 'bg-sushi-surface border border-sushi-border text-sushi-text-muted hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Ngày bắt đầu */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs text-sushi-text-dim block font-medium">
                  {t('inventory.filterStartDate')}
                </span>
                <DatePicker
                  value={draftDateRange?.[0] || null}
                  onChange={(d) => {
                    setDraftPreset('CUSTOM');
                    setDraftDateRange(computeDateRange(draftDateRange, d, true));
                  }}
                  format="DD/MM/YYYY"
                  placeholder={t('inventory.filterStartDatePlaceholder')}
                  className="w-full !rounded-xl !h-10 !text-xs [&_input]:!text-xs"
                  allowClear
                />
              </div>

              {/* Ngày kết thúc */}
              <div className="space-y-1.5">
                <span className="text-xs text-sushi-text-dim block font-medium">
                  {t('inventory.filterEndDate')}
                </span>
                <DatePicker
                  value={draftDateRange?.[1] || null}
                  onChange={(d) => {
                    setDraftPreset('CUSTOM');
                    setDraftDateRange(computeDateRange(draftDateRange, d, false));
                  }}
                  format="DD/MM/YYYY"
                  placeholder={t('inventory.filterEndDatePlaceholder')}
                  className="w-full !rounded-xl !h-10 !text-xs [&_input]:!text-xs"
                  allowClear
                />
              </div>
            </div>

            {/* Nhân viên thực hiện */}
            <div className="space-y-1.5 pt-2 border-t border-sushi-border/60">
              <label className="text-xs font-semibold text-slate-300 block">
                {t('inventory.filterPerformer')}
              </label>
              <Select
                value={draftPerformerId || undefined}
                onChange={(val) => setDraftPerformerId(val || '')}
                placeholder={t('inventory.filterSelectPerformer')}
                allowClear
                showSearch
                optionFilterProp="label"
                className="w-full !rounded-xl !text-xs [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!h-10 [&_.ant-select-selection-item]:!text-xs [&_.ant-select-selection-placeholder]:!text-xs [&_.ant-select-selection-item]:!leading-[38px] [&_.ant-select-selection-placeholder]:!leading-[38px]"
                options={performerOptions}
              />
            </div>

            {/* Loại giao dịch */}
            <div className="space-y-1.5 pt-2 border-t border-sushi-border/60">
              <label className="text-xs font-semibold text-slate-300 block">
                {t('inventory.filterType')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {transactionTypeOptions.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setDraftType(item.value)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                      draftType === item.value
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-sushi-surface border border-sushi-border text-sushi-text-muted hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer nút hành động */}
          <div className="p-4 border-t border-sushi-border bg-[#161922] grid grid-cols-2 gap-3 sticky bottom-0">
            <button
              type="button"
              onClick={handleResetDrawer}
              className="w-full py-2.5 rounded-xl border border-sushi-border bg-sushi-surface text-sushi-text font-semibold text-xs hover:bg-sushi-surface/80 hover:text-white transition-all cursor-pointer text-center"
            >
              {t('inventory.filterResetBtn')}
            </button>
            <button
              type="button"
              onClick={handleApplyDrawer}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-xs shadow-md hover:from-blue-500 hover:to-blue-400 transition-all cursor-pointer text-center"
            >
              {t('inventory.filterApplyBtn')}
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
