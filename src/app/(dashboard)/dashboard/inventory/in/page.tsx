'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  SushiButton,
  SushiPageHeader,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  ArrowLeft,
  ArrowDown,
  message,
} from '@/components/ui';
import { useProducts } from '@/features/catalog';
import { useRecordReceipt, StockReceiptInput } from '@/features/inventory';
import { APP_ROUTES } from '@/config/navigation.config';
import { useTranslation } from '@/lib/i18n';

export default function StockInPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [form] = Form.useForm<StockReceiptInput>();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const receiptMutation = useRecordReceipt();

  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.name} (SKU: ${p.sku})`,
  }));

  const handleFinish = async (values: StockReceiptInput) => {
    try {
      await receiptMutation.mutateAsync({
        productId: values.productId,
        quantity: Number(values.quantity),
        unitCost: Number(values.unitCost || 0),
        note: values.note,
      });
      form.resetFields();
      router.push(APP_ROUTES.INVENTORY);
    } catch {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <SushiPageHeader
        title={t('inventory.inTitle')}
        subtitle={t('inventory.inSubtitle')}
        extra={
          <Link href={APP_ROUTES.INVENTORY}>
            <Button icon={<ArrowLeft size={16} />}>
              {t('inventory.backToLedger')}
            </Button>
          </Link>
        }
      />

      <div className="p-6 sm:p-8 rounded-3xl bg-sushi-card border border-sushi-border shadow-md">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ quantity: 10, unitCost: 50000 }}
        >
          <Form.Item
            name="productId"
            label={t('inventory.selectProductToIn')}
            rules={[{ required: true, message: t('inventory.inQuantityRequired') }]}
          >
            <Select
              showSearch
              placeholder={t('inventory.selectProductPlaceholder')}
              loading={productsLoading}
              options={productOptions}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              className="w-full"
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
                placeholder="50,000"
              />
            </Form.Item>
          </div>

          <Form.Item name="note" label={t('inventory.noteLabel')}>
            <Input.TextArea rows={3} placeholder={t('inventory.notePlaceholder')} />
          </Form.Item>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-sushi-border/80">
            <Button onClick={() => router.push('/dashboard/inventory')} disabled={receiptMutation.isPending}>
              {t('common.cancel')}
            </Button>
            <SushiButton
              type="primary"
              htmlType="submit"
              loading={receiptMutation.isPending}
              icon={<ArrowDown size={16} weight="bold" />}
              className="bg-emerald-600 hover:bg-emerald-500 font-semibold px-8"
            >
              {t('inventory.submitIn')}
            </SushiButton>
          </div>
        </Form>
      </div>
    </div>
  );
}
