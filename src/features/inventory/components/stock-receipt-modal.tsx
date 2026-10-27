'use client';

import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
} from '@/components/ui';
import { StockBalanceItem, StockReceiptInput } from '../types';
import { useRecordReceipt } from '../hooks/use-inventory';
import { useProducts } from '@/features/catalog';
import { useTranslation } from '@/lib/i18n';

interface StockReceiptModalProps {
  open: boolean;
  onClose: () => void;
  preselectedItem?: StockBalanceItem | null;
}

interface StockReceiptFormValues {
  productId: string;
  quantity: number;
  unitCost?: number;
  note?: string;
}

export function StockReceiptModal({
  open,
  onClose,
  preselectedItem,
}: StockReceiptModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<StockReceiptFormValues>();
  const { data: products = [] } = useProducts();
  const receiptMutation = useRecordReceipt();

  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.name} (SKU: ${p.sku})`,
  }));

  const handleFinish = async (values: StockReceiptFormValues) => {
    try {
      await receiptMutation.mutateAsync({
        productId: values.productId,
        quantity: Number(values.quantity),
        unitCost: Number(values.unitCost || 0),
        note: values.note,
      });
      form.resetFields();
      onClose();
    } catch {
      // Error handled in hook
    }
  };

  return (
    <Modal
      title={t('inventory.inTitle')}
      open={open}
      centered
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      destroyOnHidden
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          productId: preselectedItem?.productId,
          quantity: 10,
          unitCost: preselectedItem?.averageUnitCost || 0,
        }}
      >
        <Form.Item
          name="productId"
          label={t('inventory.selectProductToIn')}
          rules={[{ required: true, message: t('inventory.inQuantityRequired') }]}
        >
          <Select
            showSearch
            placeholder={t('inventory.selectProductPlaceholder')}
            options={productOptions}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item
            name="quantity"
            label={t('inventory.inQuantityLabel')}
            rules={[
              { required: true, message: t('inventory.inQuantityRequired') },
              {
                validator: async (_, value) => {
                  if (value && Number(value) <= 0) {
                    throw new Error(t('inventory.inQuantityMinError'));
                  }
                },
              },
            ]}
          >
            <InputNumber<number>
              style={{ width: '100%' }}
              min={1}
              placeholder="10"
            />
          </Form.Item>

          <Form.Item
            name="unitCost"
            label={t('inventory.unitCostLabel')}
          >
            <InputNumber<number>
              style={{ width: '100%' }}
              min={0}
              step={5000}
              formatter={(val) => (val ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
              parser={(val) => (val ? Number(val.replace(/,/g, '')) : 0)}
              placeholder="0"
            />
          </Form.Item>
        </div>

        <Form.Item name="note" label={t('inventory.noteLabel')}>
          <Input.TextArea rows={3} placeholder={t('inventory.notePlaceholder')} />
        </Form.Item>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-sushi-border/80">
          <Button onClick={onClose} disabled={receiptMutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={receiptMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-500 font-semibold px-6"
          >
            {t('inventory.submitIn')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
