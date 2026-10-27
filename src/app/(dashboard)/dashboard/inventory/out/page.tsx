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
  ArrowUp,
  message,
} from '@/components/ui';
import { useStockBalances, useRecordIssue, StockIssueInput } from '@/features/inventory';
import { APP_ROUTES } from '@/config/navigation.config';
import { useTranslation } from '@/lib/i18n';

export default function StockOutPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [form] = Form.useForm<StockIssueInput>();
  const { data: balances = [], isLoading } = useStockBalances();
  const issueMutation = useRecordIssue();

  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [issueQty, setIssueQty] = useState<number>(1);

  const currentItem = balances.find((b) => b.productId === selectedProductId);
  const availableQty = currentItem ? currentItem.quantity : 0;
  const isOverStock = issueQty > availableQty;

  const productOptions = balances.map((b) => ({
    value: b.productId,
    label: `${b.productName} (SKU: ${b.productSku}) — Tồn: ${b.quantity} ${b.unitName}`,
  }));

  const handleFinish = async (values: StockIssueInput) => {
    if (isOverStock) {
      message.error(`${t('inventory.overStockError')} (${availableQty})`);
      return;
    }

    try {
      await issueMutation.mutateAsync({
        productId: values.productId,
        quantity: Number(values.quantity),
        reason: values.reason,
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
        title={t('inventory.outTitle')}
        subtitle={t('inventory.outSubtitle')}
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
          initialValues={{ quantity: 1, reason: t('inventory.defaultReasonSale') }}
        >
          <Form.Item
            name="productId"
            label={t('inventory.selectProductToOut')}
            rules={[{ required: true, message: t('inventory.selectProductRequired') }]}
          >
            <Select
              showSearch
              placeholder={t('inventory.selectProductOutPlaceholder')}
              loading={isLoading}
              options={productOptions}
              onChange={(val) => setSelectedProductId(val)}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              className="w-full"
            />
          </Form.Item>

          {/* Hộp thông tin tồn khả dụng trực quan */}
          {selectedProductId && (
            <div
              className={`p-4 rounded-2xl mb-5 border flex items-center justify-between text-xs font-mono transition-colors ${
                availableQty <= 0
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : availableQty <= 5
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              }`}
            >
              <span>{t('inventory.availableStock')}</span>
              <span className="font-extrabold text-base">
                {availableQty} {currentItem?.unitName || t('inventory.unitsUnit')}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="quantity"
              label={t('inventory.outQuantityLabel')}
              validateStatus={isOverStock ? 'error' : ''}
              help={
                isOverStock
                  ? t('inventory.overStockWarning')
                  : undefined
              }
              rules={[
                { required: true, message: t('inventory.outQuantityRequired') },
                {
                  validator: async (_, value) => {
                    if (value && Number(value) <= 0) {
                      throw new Error(t('inventory.inQuantityMinError'));
                    }
                    if (value && Number(value) > availableQty) {
                      throw new Error(t('inventory.overStockWarning'));
                    }
                  },
                },
              ]}
            >
              <InputNumber<number>
                style={{ width: '100%' }}
                min={1}
                max={availableQty > 0 ? availableQty : 1}
                value={issueQty}
                onChange={(val) => setIssueQty(Number(val || 0))}
                placeholder="1"
              />
            </Form.Item>

            <Form.Item name="reason" label={t('inventory.reasonLabel')}>
              <Select
                options={[
                  { value: 'Xuất bán lẻ', label: t('inventory.defaultReasonSale') },
                  { value: 'Xuất thanh lý / Hỏng', label: t('inventory.reasonDamaged') },
                  { value: 'Xuất dùng nội bộ', label: t('inventory.reasonInternal') },
                  { value: 'Lý do khác', label: t('inventory.reasonOther') },
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item name="note" label={t('inventory.colNote')}>
            <Input.TextArea rows={3} placeholder={t('inventory.outNotePlaceholder')} />
          </Form.Item>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-sushi-border/80">
            <Button onClick={() => router.push('/dashboard/inventory')} disabled={issueMutation.isPending}>
              {t('common.cancel')}
            </Button>
            <SushiButton
              type="primary"
              htmlType="submit"
              disabled={isOverStock || availableQty <= 0}
              loading={issueMutation.isPending}
              icon={<ArrowUp size={16} weight="bold" />}
              className="bg-blue-600 hover:bg-blue-500 font-semibold px-8 disabled:opacity-40"
            >
              {t('inventory.submitOut')}
            </SushiButton>
          </div>
        </Form>
      </div>
    </div>
  );
}
