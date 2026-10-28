'use client';

import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Alert,
} from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { useWarehouses } from '@/features/inventory';
import { useUpdateEmployee } from '../hooks/use-employees';
import { Employee, UpdateEmployeeInput } from '../types';
import { UserRole } from '@/types/auth';

interface EditEmployeeModalProps {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
}

export function EditEmployeeModal({ employee, open, onClose }: EditEmployeeModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<UpdateEmployeeInput>();
  const updateMutation = useUpdateEmployee();
  const { data: warehouses = [], isLoading: isLoadingWarehouses } = useWarehouses();

  const selectedRole = Form.useWatch('role', form);

  useEffect(() => {
    if (employee) {
      form.setFieldsValue({
        fullName: employee.fullName,
        role: employee.role,
        warehouseId: employee.warehouseId || undefined,
      });
    }
  }, [employee, form]);

  if (!employee) return null;

  const handleFinish = async (values: UpdateEmployeeInput) => {
    try {
      await updateMutation.mutateAsync({
        id: employee.id,
        data: {
          fullName: values.fullName,
          role: values.role,
          warehouseId: values.warehouseId || null,
        },
      });
      onClose();
    } catch {
      // Handled in hook
    }
  };

  const roleOptions = [
    { value: 'WAREHOUSE_STAFF' as UserRole, label: t('common.warehouseStaff') },
    { value: 'WAREHOUSE_MANAGER' as UserRole, label: t('common.warehouseManager') },
    { value: 'SUPER_ADMIN' as UserRole, label: t('common.superAdmin') },
  ];

  const warehouseOptions = warehouses.map((w) => ({
    value: w.id,
    label: `${w.name} (${w.code})`,
  }));

  return (
    <Modal
      title={`${t('employees.editEmployee')} - ${employee.email}`}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      centered
      className="max-w-md"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4 space-y-3"
      >
        <Form.Item
          name="fullName"
          label={t('employees.colName')}
          rules={[{ required: true, message: t('auth.nameRequired') }]}
        >
          <Input placeholder={t('employees.fullNamePlaceholder')} className="h-10 rounded-xl" />
        </Form.Item>

        <Form.Item
          name="role"
          label={t('employees.colRole')}
          rules={[{ required: true, message: t('employees.selectRole') }]}
        >
          <Select
            options={roleOptions}
            disabled={employee?.role === 'SUPER_ADMIN'}
            className="w-full h-10"
          />
        </Form.Item>

        {employee?.role === 'SUPER_ADMIN' && (
          <Alert
            title={t('employees.superAdminRoleImmutable')}
            type="warning"
            showIcon
            className="text-xs mb-3 rounded-xl"
          />
        )}

        <Form.Item
          name="warehouseId"
          label={t('employees.colWarehouse')}
          rules={[
            {
              required: selectedRole === 'WAREHOUSE_STAFF',
              message: t('employees.selectWarehouse'),
            },
          ]}
        >
          <Select
            options={warehouseOptions}
            loading={isLoadingWarehouses}
            placeholder={t('employees.selectWarehouse')}
            allowClear={selectedRole !== 'WAREHOUSE_STAFF'}
            className="w-full h-10"
          />
        </Form.Item>

        {selectedRole === 'WAREHOUSE_STAFF' && (
          <Alert
            title={t('employees.warehouseStaffNotice')}
            type="info"
            showIcon
            className="text-xs mb-3 rounded-xl"
          />
        )}

        <div className="flex justify-end gap-2 pt-3">
          <Button onClick={onClose} className="rounded-xl h-10">
            {t('common.cancel')}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={updateMutation.isPending}
            className="rounded-xl h-10 font-semibold bg-sushi-primary hover:bg-sushi-primary-hover border-none"
          >
            {t('products.saveChanges') || 'Lưu thay đổi'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
