'use client';

import React from 'react';
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
import { useCreateEmployee } from '../hooks/use-employees';
import { CreateEmployeeInput } from '../types';
import { UserRole } from '@/types/auth';

interface CreateEmployeeModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateEmployeeModal({ open, onClose }: CreateEmployeeModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<CreateEmployeeInput>();
  const createMutation = useCreateEmployee();
  const { data: warehouses = [], isLoading: isLoadingWarehouses } = useWarehouses();

  const selectedRole = Form.useWatch('role', form);

  const handleFinish = async (values: CreateEmployeeInput) => {
    try {
      await createMutation.mutateAsync(values);
      form.resetFields();
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
      title={t('employees.addEmployee')}
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      destroyOnHidden
      centered
      className="max-w-md"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ role: 'WAREHOUSE_STAFF' }}
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
          name="email"
          label={t('employees.colEmail')}
          rules={[
            { required: true, message: t('auth.emailRequired') },
            { type: 'email', message: t('auth.emailInvalid') },
          ]}
        >
          <Input placeholder={t('employees.emailPlaceholder')} className="h-10 rounded-xl" />
        </Form.Item>

        <Form.Item
          name="password"
          label={t('auth.passwordLabel')}
          rules={[
            { required: true, message: t('auth.passwordRequired') },
            { min: 6, message: t('employees.passwordPlaceholder') },
          ]}
        >
          <Input.Password
            placeholder={t('employees.passwordPlaceholder')}
            className="h-10 rounded-xl"
          />
        </Form.Item>

        <Form.Item
          name="role"
          label={t('employees.colRole')}
          rules={[{ required: true, message: t('employees.selectRole') }]}
        >
          <Select options={roleOptions} className="w-full h-10" />
        </Form.Item>

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
            loading={createMutation.isPending}
            className="rounded-xl h-10 font-semibold bg-sushi-primary hover:bg-sushi-primary-hover border-none"
          >
            {t('common.create')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
