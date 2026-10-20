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

export default function StockOutPage() {
  const router = useRouter();
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
      router.push(APP_ROUTES.INVENTORY);
    } catch {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <SushiPageHeader
        title="Phiếu Xuất Kho Hàng Hóa"
        subtitle="Xuất hàng hóa ra khỏi kho, kiểm soát chống xuất âm và ghi nhận giảm số dư tồn tức thời"
        extra={
          <Link href={APP_ROUTES.INVENTORY}>
            <Button icon={<ArrowLeft size={16} />}>
              Quay lại Sổ Tồn
            </Button>
          </Link>
        }
      />

      <div className="p-6 sm:p-8 rounded-3xl bg-sushi-card border border-sushi-border shadow-md">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ quantity: 1, reason: 'Xuất bán lẻ' }}
        >
          <Form.Item
            name="productId"
            label="Mặt hàng cần xuất kho"
            rules={[{ required: true, message: 'Vui lòng chọn mặt hàng xuất!' }]}
          >
            <Select
              showSearch
              placeholder="Chọn mặt hàng từ kho"
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
              <span>Số lượng tồn kho khả dụng:</span>
              <span className="font-extrabold text-base">
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
                  ? `Vượt quá tồn khả dụng! Tối đa chỉ có thể xuất ${availableQty}`
                  : undefined
              }
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng!' },
                {
                  validator: async (_, value) => {
                    if (value && Number(value) <= 0) {
                      throw new Error('Số lượng xuất phải lớn hơn 0');
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

            <Form.Item name="reason" label="Lý do xuất kho">
              <Select
                options={[
                  { value: 'Xuất bán lẻ', label: 'Xuất bán lẻ' },
                  { value: 'Xuất theo đơn đặt hàng', label: 'Xuất theo đơn đặt hàng' },
                  { value: 'Xuất chuyển kho nội bộ', label: 'Xuất chuyển kho nội bộ' },
                  { value: 'Xuất mẫu thử nghiệm', label: 'Xuất mẫu thử nghiệm' },
                  { value: 'Xuất thanh lý / Hỏng', label: 'Xuất thanh lý / Hỏng' },
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item name="note" label="Ghi chú phiếu xuất">
            <Input.TextArea rows={3} placeholder="Ví dụ: Xuất cho khách hàng theo yêu cầu..." />
          </Form.Item>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-sushi-border/80">
            <Button onClick={() => router.push('/dashboard/inventory')} disabled={issueMutation.isPending}>
              Hủy bỏ
            </Button>
            <SushiButton
              type="primary"
              htmlType="submit"
              disabled={isOverStock || availableQty <= 0}
              loading={issueMutation.isPending}
              icon={<ArrowUp size={16} weight="bold" />}
              className="bg-blue-600 hover:bg-blue-500 font-semibold px-8 disabled:opacity-40"
            >
              Xác Nhận Xuất Kho
            </SushiButton>
          </div>
        </Form>
      </div>
    </div>
  );
}
