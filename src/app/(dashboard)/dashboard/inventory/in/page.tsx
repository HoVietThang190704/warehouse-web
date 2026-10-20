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
import { useRecordReceipt } from '@/features/inventory';

export default function StockInPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const receiptMutation = useRecordReceipt();

  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.name} (SKU: ${p.sku})`,
  }));

  const handleFinish = async (values: any) => {
    try {
      await receiptMutation.mutateAsync({
        productId: values.productId,
        quantity: Number(values.quantity),
        unitCost: Number(values.unitCost || 0),
        note: values.note,
      });
      form.resetFields();
      router.push('/dashboard/inventory');
    } catch {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <SushiPageHeader
        title="Phiếu Nhập Kho Hàng Hóa"
        subtitle="Ghi nhận lô hàng nhập vào kho, cập nhật tăng số dư tồn kho và ghi sổ cái bất biến"
        extra={
          <Link href="/dashboard/inventory">
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
          initialValues={{ quantity: 10, unitCost: 50000 }}
        >
          <Form.Item
            name="productId"
            label="Chọn mặt hàng cần nhập"
            rules={[{ required: true, message: 'Vui lòng chọn mặt hàng nhập!' }]}
          >
            <Select
              showSearch
              placeholder="Gõ để tìm kiếm theo tên hoặc mã SKU"
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
              label="Số lượng nhập kho"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng!' },
                {
                  validator: async (_, value) => {
                    if (value && Number(value) <= 0) {
                      throw new Error('Số lượng phải lớn hơn 0');
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
              label="Đơn giá vốn nhập (VNĐ)"
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

          <Form.Item name="note" label="Ghi chú phiếu nhập">
            <Input.TextArea rows={3} placeholder="Ví dụ: Nhập bổ sung lô hàng từ nhà cung cấp..." />
          </Form.Item>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-sushi-border/80">
            <Button onClick={() => router.push('/dashboard/inventory')} disabled={receiptMutation.isPending}>
              Hủy bỏ
            </Button>
            <SushiButton
              type="primary"
              htmlType="submit"
              loading={receiptMutation.isPending}
              icon={<ArrowDown size={16} weight="bold" />}
              className="bg-emerald-600 hover:bg-emerald-500 font-semibold px-8"
            >
              Hoàn Tất Nhập Kho
            </SushiButton>
          </div>
        </Form>
      </div>
    </div>
  );
}
