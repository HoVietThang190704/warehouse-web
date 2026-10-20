'use client';

import { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Space } from '@/components/ui';
import { Category, UpdateCategoryInput } from '../types';
import { updateCategorySchema } from '../schemas/catalog.schema';
import { createZodRule } from '@/lib/zod-validator';
import { useTranslation } from '@/lib/i18n';

interface EditCategoryModalProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSubmit: (id: string, dto: UpdateCategoryInput) => Promise<unknown>;
}

export function EditCategoryModal({
  open,
  category,
  onClose,
  onSubmit,
}: EditCategoryModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (category && open) {
      form.setFieldsValue({
        name: category.name,
      });
    }
  }, [category, open, form]);

  const handleSubmit = async (values: unknown) => {
    if (!category) return;
    setSubmitting(true);

    const result = updateCategorySchema.safeParse(values);
    if (!result.success) {
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit(category.id, result.data);
      form.resetFields();
      onClose();
    } catch {
      // Handled in mutation hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Chỉnh Sửa Nhóm Hàng Hóa"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      centered
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label={t('dashboard.categoryNameLabel')}
          rules={[createZodRule(updateCategorySchema, 'name')]}
        >
          <Input placeholder={t('dashboard.categoryNamePlaceholder')} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Lưu Thay Đổi
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
