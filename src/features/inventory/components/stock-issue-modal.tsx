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

interface StockIssueModalProps {
  open: boolean;
  onClose: () => void;
  preselectedItem?: StockBalanceItem | null;
}

export function StockIssueModal({
  open,
  onClose,
  preselectedItem,
}: StockIssueModalProps) {
  const [form] = Form.useForm();
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

  const handleFinish = async (values: any) => {
    if (isOverStock) {
      message.error(`Không thể xuất quá số lượng tồn kho khả dụng (${availableQty})`);
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
      title="Tạo Phiếu Xuất Kho Hàng Hóa"
      open={open}
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
          reason: 'Xuất bán lẻ',
        }}
      >
        <Form.Item
          name="productId"
          label="Mặt hàng cần xuất"
          rules={[{ required: true, message: 'Vui lòng chọn mặt hàng!' }]}
        >
          <Select
            showSearch
            placeholder="Tìm theo tên hoặc mã SKU"
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
            <span>Số lượng tồn kho khả dụng:</span>
            <span className="font-extrabold text-sm">
              {availableQty} {currentItem?.unitName || 'đơn vị'}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item
            name="quantity"
            label="Số lượng xuất"
            validateStatus={isOverStock ? 'error' : ''}
            help={
              isOverStock
                ? `Vượt quá tồn kho! Tối đa chỉ có thể xuất ${availableQty}`
                : undefined
            }
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng!' },
              {
                validator: async (_, value) => {
                  if (value && Number(value) <= 0) {
                    throw new Error('Số lượng xuất phải > 0');
                  }
                  if (value && Number(value) > availableQty) {
                    throw new Error(`Tồn kho không đủ (Khả dụng: ${availableQty})`);
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

          <Form.Item name="reason" label="Lý do xuất">
            <Select
              options={[
                { value: 'Xuất bán lẻ', label: 'Xuất bán lẻ' },
                { value: 'Xuất theo đơn đặt hàng', label: 'Xuất theo đơn đặt hàng' },
                { value: 'Xuất chuyển nội bộ', label: 'Xuất chuyển nội bộ' },
                { value: 'Xuất kiểm mẫu / Trưng bày', label: 'Xuất kiểm mẫu / Trưng bày' },
                { value: 'Xuất hủy hỏng', label: 'Xuất hủy hỏng' },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item name="note" label="Ghi chú thêm">
          <Input.TextArea rows={2} placeholder="Ví dụ: Giao cho khách tại quầy..." />
        </Form.Item>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-sushi-border/80">
          <Button onClick={onClose} disabled={issueMutation.isPending}>
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            disabled={isOverStock || availableQty <= 0}
            loading={issueMutation.isPending}
            className="bg-blue-600 hover:bg-blue-500 font-semibold px-6 disabled:opacity-50"
          >
            Xác Nhận Xuất Kho
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
