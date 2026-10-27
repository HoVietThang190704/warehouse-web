'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
} from '@/components/ui';
import { StockBalanceItem } from '../types';
import { useRecordIssue, useStockBalances } from '../hooks/use-inventory';
import { useTranslation } from '@/lib/i18n';

interface StockIssueModalProps {
  open: boolean;
  onClose: () => void;
  preselectedItem?: StockBalanceItem | null;
}

interface StockIssueFormValues {
  productId: string;
  quantity: number;
  reason?: string;
  note?: string;
}

export function StockIssueModal({
  open,
  onClose,
  preselectedItem,
}: StockIssueModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<StockIssueFormValues>();
  const { data: balances = [] } = useStockBalances();
  const issueMutation = useRecordIssue();

  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(
    preselectedItem?.productId,
  );
  const [issueQty, setIssueQty] = useState<number>(1);

  // Sync when preselectedItem changes
  useEffect(() => {
    if (preselectedItem) {
      setSelectedProductId(preselectedItem.productId);
      form.setFieldsValue({
        productId: preselectedItem.productId,
        quantity: 1,
      });
      setIssueQty(1);
    }
  }, [preselectedItem, form]);

  const currentItem = balances.find((b) => b.productId === selectedProductId);
  const availableQty = currentItem ? currentItem.quantity : 0;
  const isOverStock = issueQty > availableQty;

  const productOptions = balances.map((b) => ({
    value: b.productId,
    label: `${b.productName} (SKU: ${b.productSku}) — Tồn: ${b.quantity} ${b.unitName}`,
  }));

  const handleFinish = async (values: StockIssueFormValues) => {
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
      onClose();
    } catch {
      // Error handled in hook
    }
  };

  return (
    <Modal
      title={t('inventory.outTitle')}
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
          quantity: 1,
          reason: t('inventory.defaultReasonSale'),
        }}
      >
        <Form.Item
          name="productId"
          label={t('inventory.selectProductToOut')}
          rules={[{ required: true, message: t('inventory.selectProductRequired') }]}
        >
          <Select
            showSearch
            placeholder={t('inventory.selectProductOutPlaceholder')}
            options={productOptions}
            onChange={(val) => setSelectedProductId(val)}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        {/* Thông tin số lượng khả dụng */}
        {selectedProductId && (
          <div
            className={`p-3 rounded-xl mb-4 border flex items-center justify-between text-xs font-mono ${
              availableQty <= 0
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : availableQty <= 5
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
            }`}
          >
            <span>{t('inventory.availableStock')}</span>
            <span className="font-extrabold text-sm">
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
                ? `${t('inventory.overStockWarning')} (${availableQty})`
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
                    throw new Error(`${t('inventory.overStockError')} (${availableQty})`);
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
          <Input.TextArea rows={2} placeholder={t('inventory.outNotePlaceholder')} />
        </Form.Item>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-sushi-border/80">
          <Button onClick={onClose} disabled={issueMutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            disabled={isOverStock || availableQty <= 0}
            loading={issueMutation.isPending}
            className="bg-blue-600 hover:bg-blue-500 font-semibold px-6 disabled:opacity-50"
          >
            {t('inventory.submitOut')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
