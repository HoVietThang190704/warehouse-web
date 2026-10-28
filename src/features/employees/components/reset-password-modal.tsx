'use client';

import React from 'react';
import { Modal, Form, Input, Button } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { useResetEmployeePassword } from '../hooks/use-employees';
import { Employee, ResetPasswordInput } from '../types';

interface ResetPasswordModalProps {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
}

export function ResetPasswordModal({ employee, open, onClose }: ResetPasswordModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<ResetPasswordInput>();
  const resetMutation = useResetEmployeePassword();

  if (!employee) return null;

  const handleFinish = async (values: ResetPasswordInput) => {
    try {
      await resetMutation.mutateAsync({
        id: employee.id,
        data: values,
      });
      form.resetFields();
      onClose();
    } catch {
      // Handled in hook
    }
  };

  return (
    <Modal
      title={`${t('employees.resetPassword')} - ${employee.fullName} (${employee.email})`}
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
        className="mt-4 space-y-4"
      >
        <Form.Item
          name="newPassword"
          label={t('employees.resetPassword')}
          rules={[
            { required: true, message: t('auth.passwordRequired') },
            { min: 6, message: t('employees.passwordPlaceholder') },
          ]}
        >
          <Input.Password
            placeholder={t('employees.newPasswordPlaceholder')}
            className="h-10 rounded-xl"
          />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose} className="rounded-xl h-10">
            {t('common.cancel')}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={resetMutation.isPending}
            className="rounded-xl h-10 font-semibold bg-sushi-primary hover:bg-sushi-primary-hover border-none"
          >
            {t('employees.resetPassword')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
