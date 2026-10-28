'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Popconfirm,
  Tooltip,
  PencilSimple,
  Key,
  LockSimple,
  ShieldCheck,
  MagnifyingGlass,
  Warehouse,
  Pagination,
} from '@/components/ui';
import type { TableColumnsType } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { Employee } from '../types';
import { UserRole } from '@/types/auth';
import { useUpdateEmployeeStatus } from '../hooks/use-employees';
import { useAuth } from '@/features/auth';

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  onEdit: (employee: Employee) => void;
  onResetPassword: (employee: Employee) => void;
}

export function EmployeeTable({
  employees,
  isLoading,
  onEdit,
  onResetPassword,
}: EmployeeTableProps) {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const statusMutation = useUpdateEmployeeStatus();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [mobilePage, setMobilePage] = useState<number>(1);
  const pageSize = 10;

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        search === '' ||
        emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase());

      const matchRole = roleFilter === 'ALL' || emp.role === roleFilter;

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && emp.isActive) ||
        (statusFilter === 'LOCKED' && !emp.isActive);

      return matchSearch && matchRole && matchStatus;
    });
  }, [employees, search, roleFilter, statusFilter]);

  // Danh sách phân trang cho chế độ mobile card
  const paginatedEmployees = useMemo(() => {
    const start = (mobilePage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, mobilePage, pageSize]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setMobilePage(1);
  };

  const handleRoleFilterChange = (val: string) => {
    setRoleFilter(val);
    setMobilePage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setMobilePage(1);
  };

  const getRoleTag = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <Tag color="red" className="font-semibold px-2.5 py-0.5 rounded-lg border-none bg-red-500/15 text-red-400 m-0">
            {t('common.superAdmin')}
          </Tag>
        );
      case 'WAREHOUSE_MANAGER':
        return (
          <Tag color="blue" className="font-semibold px-2.5 py-0.5 rounded-lg border-none bg-blue-500/15 text-blue-400 m-0">
            {t('common.warehouseManager')}
          </Tag>
        );
      case 'WAREHOUSE_STAFF':
      default:
        return (
          <Tag color="green" className="font-semibold px-2.5 py-0.5 rounded-lg border-none bg-emerald-500/15 text-emerald-400 m-0">
            {t('common.warehouseStaff')}
          </Tag>
        );
    }
  };

  const columns: TableColumnsType<Employee> = [
    {
      title: t('employees.colName'),
      key: 'name',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sushi-text text-sm">{record.fullName}</span>
          <span className="text-xs text-sushi-text-muted font-mono">{record.email}</span>
        </div>
      ),
    },
    {
      title: t('employees.colRole'),
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => getRoleTag(role),
    },
    {
      title: t('employees.colWarehouse'),
      key: 'warehouse',
      render: (_, record) => {
        if (!record.warehouseName) {
          return (
            <span className="text-xs text-sushi-text-muted italic">
              {t('employees.unassigned')}
            </span>
          );
        }
        return (
          <div className="flex items-center gap-1.5 text-xs text-sushi-text font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-sushi-primary"></span>
            <span>{record.warehouseName}</span>
            {record.warehouseCode && (
              <span className="text-sushi-text-muted font-mono">({record.warehouseCode})</span>
            )}
          </div>
        );
      },
    },
    {
      title: t('employees.colStatus'),
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive: boolean) =>
        isActive ? (
          <Tag color="success" className="rounded-lg px-2 py-0.5 border-none bg-emerald-500/15 text-emerald-400 font-medium text-xs">
            {t('employees.statusActive')}
          </Tag>
        ) : (
          <Tag color="error" className="rounded-lg px-2 py-0.5 border-none bg-zinc-500/20 text-zinc-400 font-medium text-xs">
            {t('employees.statusLocked')}
          </Tag>
        ),
    },
    {
      title: t('employees.colActions'),
      key: 'actions',
      align: 'right',
      render: (_, record) => {
        const isSelf = currentUser?.id === record.id;
        const isSuperAdminOther = record.role === 'SUPER_ADMIN' && !isSelf;
        const canLock = !isSelf && record.role !== 'SUPER_ADMIN';

        return (
          <Space size="small">
            <Tooltip title={t('employees.editEmployee')}>
              <Button
                type="text"
                size="small"
                icon={<PencilSimple size={16} />}
                onClick={() => onEdit(record)}
                className="text-sushi-text-muted hover:text-white hover:bg-white/5 rounded-lg"
              />
            </Tooltip>

            <Tooltip
              title={
                isSuperAdminOther
                  ? t('employees.cannotResetOtherSuperAdmin')
                  : t('employees.resetPassword')
              }
            >
              <Button
                type="text"
                size="small"
                disabled={isSuperAdminOther}
                icon={<Key size={16} />}
                onClick={() => onResetPassword(record)}
                className={`rounded-lg ${
                  isSuperAdminOther
                    ? 'text-sushi-text-dim/40 cursor-not-allowed'
                    : 'text-sushi-text-muted hover:text-amber-400 hover:bg-amber-500/10'
                }`}
              />
            </Tooltip>

            <Tooltip
              title={
                isSelf
                  ? t('employees.cannotLockSelf')
                  : record.role === 'SUPER_ADMIN'
                  ? t('employees.cannotLockSuperAdmin')
                  : record.isActive
                  ? t('employees.lockAccount')
                  : t('employees.unlockAccount')
              }
            >
              <Popconfirm
                title={
                  record.isActive
                    ? t('employees.lockConfirm')
                    : t('employees.unlockConfirm')
                }
                onConfirm={() =>
                  statusMutation.mutate({
                    id: record.id,
                    isActive: !record.isActive,
                  })
                }
                disabled={!canLock}
                okText={t('common.active') || 'Đồng ý'}
                cancelText={t('common.cancel')}
              >
                <Button
                  type="text"
                  size="small"
                  disabled={!canLock}
                  icon={
                    record.isActive ? (
                      <LockSimple
                        size={16}
                        className={!canLock ? 'text-sushi-text-dim/40' : 'text-amber-400/80'}
                      />
                    ) : (
                      <ShieldCheck size={16} className="text-emerald-400" />
                    )
                  }
                  className={`rounded-lg ${
                    !canLock
                      ? 'text-sushi-text-dim/40 cursor-not-allowed'
                      : 'text-sushi-text-muted hover:bg-white/5'
                  }`}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const roleFilterOptions = [
    { value: 'ALL', label: t('employees.allRoles') },
    { value: 'WAREHOUSE_STAFF', label: t('common.warehouseStaff') },
    { value: 'WAREHOUSE_MANAGER', label: t('common.warehouseManager') },
    { value: 'SUPER_ADMIN', label: t('common.superAdmin') },
  ];

  const statusFilterOptions = [
    { value: 'ALL', label: t('common.status') },
    { value: 'ACTIVE', label: t('employees.statusActive') },
    { value: 'LOCKED', label: t('employees.statusLocked') },
  ];

  return (
    <div className="space-y-4">
      {/* Thanh bộ lọc tìm kiếm */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-sushi-card border border-sushi-border">
        <Input
          prefix={<MagnifyingGlass size={16} className="text-sushi-text-muted mr-1" />}
          placeholder={t('employees.searchPlaceholder')}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          allowClear
          className="w-full sm:max-w-xs h-9 rounded-xl"
        />

        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={roleFilter}
            onChange={handleRoleFilterChange}
            options={roleFilterOptions}
            className="w-full sm:w-40 h-9"
          />
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            options={statusFilterOptions}
            className="w-full sm:w-32 h-9"
          />
        </div>
      </div>

      {/* Vùng hiển thị dữ liệu: Mobile Cards (sm:hidden) + Desktop Table (hidden sm:block) */}
      <div className="rounded-2xl border border-sushi-border bg-sushi-card overflow-hidden">
        {/* 1. Mobile Cards */}
        <div className="block sm:hidden p-3.5 space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-sushi-text-muted">
              {t('common.loading')}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-8 text-center text-xs text-sushi-text-muted">
              {employees.length === 0 ? t('employees.noEmployees') : t('employees.noSearchResults')}
            </div>
          ) : (
            <>
              {paginatedEmployees.map((emp) => {
                const isSelf = currentUser?.id === emp.id;
                const isSuperAdminOther = emp.role === 'SUPER_ADMIN' && !isSelf;
                const canLock = !isSelf && emp.role !== 'SUPER_ADMIN';

                return (
                  <div
                    key={emp.id}
                    className="p-3.5 rounded-xl bg-sushi-surface/80 border border-sushi-border space-y-3 shadow-xs"
                  >
                    {/* Header Card: Tên, Email & Tag Trạng thái */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sushi-text text-sm truncate">
                          {emp.fullName}
                        </div>
                        <div className="text-xs text-sushi-text-muted font-mono truncate mt-0.5">
                          {emp.email}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {emp.isActive ? (
                          <Tag
                            color="success"
                            className="rounded-lg px-2 py-0.5 border-none bg-emerald-500/15 text-emerald-400 font-medium text-xs m-0"
                          >
                            {t('employees.statusActive')}
                          </Tag>
                        ) : (
                          <Tag
                            color="error"
                            className="rounded-lg px-2 py-0.5 border-none bg-zinc-500/20 text-zinc-400 font-medium text-xs m-0"
                          >
                            {t('employees.statusLocked')}
                          </Tag>
                        )}
                      </div>
                    </div>

                    {/* Chi tiết Vai trò & Kho phụ trách */}
                    <div className="p-2.5 rounded-lg bg-sushi-card/90 border border-sushi-border/60 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sushi-text-muted">{t('employees.colRole')}:</span>
                        {getRoleTag(emp.role)}
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-sushi-border/40">
                        <span className="text-sushi-text-muted shrink-0">{t('employees.colWarehouse')}:</span>
                        {emp.warehouseName ? (
                          <div className="flex items-center gap-1.5 text-sushi-text font-medium truncate">
                            <Warehouse size={14} className="text-sushi-primary shrink-0" />
                            <span className="truncate">{emp.warehouseName}</span>
                            {emp.warehouseCode && (
                              <span className="text-sushi-text-muted font-mono shrink-0">
                                ({emp.warehouseCode})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sushi-text-muted italic">{t('employees.unassigned')}</span>
                        )}
                      </div>
                    </div>

                    {/* Thanh nút thao tác trên mobile: chia thành 2 hàng để tránh tràn chữ và đè lên nhau */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        size="small"
                        icon={<PencilSimple size={14} className="shrink-0" />}
                        onClick={() => onEdit(emp)}
                        className="w-full h-8.5 rounded-lg bg-sushi-surface hover:bg-white/10 text-sushi-text border border-sushi-border text-xs flex items-center justify-center gap-1.5 font-medium px-2"
                      >
                        <span className="truncate">{t('dashboard.edit')}</span>
                      </Button>

                      <Tooltip title={isSuperAdminOther ? t('employees.cannotResetOtherSuperAdmin') : ''}>
                        <Button
                          size="small"
                          disabled={isSuperAdminOther}
                          icon={
                            <Key
                              size={14}
                              className={`shrink-0 ${
                                isSuperAdminOther ? 'text-sushi-text-dim' : 'text-amber-400'
                              }`}
                            />
                          }
                          onClick={() => onResetPassword(emp)}
                          className={`w-full h-8.5 rounded-lg border text-xs flex items-center justify-center gap-1.5 font-medium px-2 ${
                            isSuperAdminOther
                              ? 'bg-sushi-surface/50 text-sushi-text-dim border-sushi-border/60 cursor-not-allowed opacity-60'
                              : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <span className="truncate">{t('employees.resetPassword')}</span>
                        </Button>
                      </Tooltip>

                      <div className="col-span-2">
                        <Tooltip
                          title={
                            isSelf
                              ? t('employees.cannotLockSelf')
                              : emp.role === 'SUPER_ADMIN'
                              ? t('employees.cannotLockSuperAdmin')
                              : ''
                          }
                        >
                          <Popconfirm
                            title={
                              emp.isActive ? t('employees.lockConfirm') : t('employees.unlockConfirm')
                            }
                            onConfirm={() =>
                              statusMutation.mutate({
                                id: emp.id,
                                isActive: !emp.isActive,
                              })
                            }
                            disabled={!canLock}
                            okText={t('common.active') || 'Đồng ý'}
                            cancelText={t('common.cancel')}
                          >
                            <Button
                              size="small"
                              disabled={!canLock}
                              icon={
                                emp.isActive ? (
                                  <LockSimple
                                    size={14}
                                    className={`shrink-0 ${
                                      !canLock ? 'text-sushi-text-dim' : 'text-amber-400/90'
                                    }`}
                                  />
                                ) : (
                                  <ShieldCheck size={14} className="shrink-0 text-emerald-400" />
                                )
                              }
                              className={`w-full h-8.5 rounded-lg border text-xs flex items-center justify-center gap-1.5 font-medium px-3 ${
                                !canLock
                                  ? 'bg-sushi-surface/50 text-sushi-text-dim border-sushi-border/60 cursor-not-allowed opacity-60'
                                  : emp.isActive
                                  ? 'bg-sushi-surface hover:bg-amber-500/10 text-amber-400/90 hover:text-amber-300 border-amber-500/30 hover:border-amber-500/50'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/50'
                              }`}
                            >
                              <span className="truncate">
                                {emp.isActive ? t('employees.lockAccount') : t('employees.unlockAccount')}
                              </span>
                            </Button>
                          </Popconfirm>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Phân trang mobile */}
              {filteredEmployees.length > pageSize && (
                <div className="flex justify-center pt-2">
                  <Pagination
                    current={mobilePage}
                    pageSize={pageSize}
                    total={filteredEmployees.length}
                    onChange={setMobilePage}
                    size="small"
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* 2. Desktop Table */}
        <div className="hidden sm:block">
          <Table<Employee>
            columns={columns}
            dataSource={filteredEmployees}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              className: 'px-4 py-2',
            }}
            className="sushi-table"
          />
        </div>
      </div>
    </div>
  );
}
