'use client';

import React, { useState } from 'react';
import {
  SushiPageHeader,
  Button,
  Plus,
  UnauthorizedCard,
} from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/features/auth';
import {
  useEmployees,
  Employee,
  EmployeeTable,
  CreateEmployeeModal,
  EditEmployeeModal,
  ResetPasswordModal,
} from '@/features/employees';

export default function EmployeesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const { data: employees = [], isLoading } = useEmployees(isSuperAdmin);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [resetPasswordEmployee, setResetPasswordEmployee] = useState<Employee | null>(null);

  // Chỉ SUPER_ADMIN mới có quyền xem và thao tác trên trang nhân sự
  if (user && !isSuperAdmin) {
    return <UnauthorizedCard />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <SushiPageHeader
        title={t('employees.title')}
        subtitle={t('employees.subtitle')}
        extra={
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setCreateModalOpen(true)}
            className="rounded-xl h-10 font-semibold px-4 bg-sushi-primary hover:bg-sushi-primary-hover border-none"
          >
            {t('employees.addEmployee')}
          </Button>
        }
      />

      <EmployeeTable
        employees={employees}
        isLoading={isLoading}
        onEdit={(emp) => setEditingEmployee(emp)}
        onResetPassword={(emp) => setResetPasswordEmployee(emp)}
      />

      {/* Modal Thêm Nhân Viên */}
      {createModalOpen && (
        <CreateEmployeeModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
        />
      )}

      {/* Modal Sửa Nhân Viên */}
      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          open={Boolean(editingEmployee)}
          onClose={() => setEditingEmployee(null)}
        />
      )}

      {/* Modal Đặt Lại Mật Khẩu */}
      {resetPasswordEmployee && (
        <ResetPasswordModal
          employee={resetPasswordEmployee}
          open={Boolean(resetPasswordEmployee)}
          onClose={() => setResetPasswordEmployee(null)}
        />
      )}
    </div>
  );
}
