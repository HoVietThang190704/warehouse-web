'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  ImageSquare,
  Trash,
  Spin,
  message,
} from '@/components/ui';
import { CreateProductInput } from '../types';
import { createProductSchema } from '../schemas/catalog.schema';
import { catalogApi } from '../api/catalog.api';
import { createZodRule } from '@/lib/zod-validator';
import { useTranslation } from '@/lib/i18n';
import { useCategoryOptions, useUnitOptions } from '../hooks/use-categories';

interface CreateProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateProductInput) => Promise<unknown>;
}

export function CreateProductModal({
  open,
  onClose,
  onSubmit,
}: CreateProductModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { options: categoryOptions } = useCategoryOptions();
  const { options: unitOptions } = useUnitOptions();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file hình ảnh (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước ảnh tối đa là 5MB');
      return;
    }

    try {
      setUploading(true);
      const result = await catalogApi.uploadImage(file);
      setImageUrl(result.url);
      form.setFieldValue('imageUrl', result.url);
      message.success('Tải ảnh lên thành công!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải ảnh lên thất bại';
      message.error(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    form.setFieldValue('imageUrl', '');
  };

  const handleSubmit = async (values: unknown) => {
    setSubmitting(true);

    const result = createProductSchema.safeParse(values);
    if (!result.success) {
      message.error(result.error.issues[0]?.message || 'Dữ liệu không hợp lệ');
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit(result.data);
      form.resetFields();
      setImageUrl('');
      onClose();
    } catch {
      // Handled in mutation
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    form.resetFields();
    setImageUrl('');
    onClose();
  };

  return (
    <Modal
      title="Thêm Hàng Hóa Mới Vào Kho"
      open={open}
      onCancel={handleModalClose}
      footer={null}
      destroyOnHidden
      width={580}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ minStock: 5, costPrice: 0, sellingPrice: 0 }}
      >
        {/* Tên hàng */}
        <Form.Item
          name="name"
          label="Tên hàng hóa"
          rules={[createZodRule(createProductSchema, 'name')]}
        >
          <Input placeholder="Ví dụ: Pin sạc dự phòng 20000mAh..." />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mã SKU */}
          <Form.Item
            name="sku"
            label="Mã SKU"
            rules={[createZodRule(createProductSchema, 'sku')]}
          >
            <Input placeholder="Ví dụ: SP-PIN-01" className="uppercase font-mono" />
          </Form.Item>

          {/* Barcode */}
          <Form.Item
            name="barcode"
            label="Mã vạch (Barcode)"
          >
            <Input placeholder="893000..." className="font-mono" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nhóm hàng */}
          <Form.Item
            name="categoryId"
            label="Nhóm hàng"
          >
            <Select
              placeholder="Chọn nhóm hàng"
              allowClear
              options={categoryOptions}
            />
          </Form.Item>

          {/* Đơn vị tính */}
          <Form.Item
            name="baseUnitId"
            label="Đơn vị tính cơ sở"
          >
            <Select
              placeholder="Chọn đơn vị tính (Cái, Hộp...)"
              allowClear
              options={unitOptions}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Ngưỡng cảnh báo tồn tối thiểu */}
          <Form.Item
            name="minStock"
            label={
              <span className="text-amber-400 font-medium">
                Ngưỡng cảnh báo (&le;)
              </span>
            }
            rules={[createZodRule(createProductSchema, 'minStock')]}
            tooltip="Hệ thống sẽ bật cờ vàng và đưa vào danh sách cảnh báo hụt hàng khi tồn kho chạm ngưỡng này (Mặc định: 5)"
          >
            <InputNumber<number>
              style={{ width: '100%' }}
              min={0}
              placeholder="5"
            />
          </Form.Item>

          {/* Giá vốn */}
          <Form.Item
            name="costPrice"
            label="Giá vốn ước tính (VNĐ)"
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

          {/* Giá bán */}
          <Form.Item
            name="sellingPrice"
            label="Giá bán (VNĐ)"
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

        {/* Upload Ảnh */}
        <Form.Item
          name="imageUrl"
          label="Hình ảnh sản phẩm (Cloudinary)"
        >
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {imageUrl ? (
              <div className="p-3 rounded-2xl bg-sushi-surface border border-sushi-border flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-sushi-border shrink-0">
                    <Image
                      src={imageUrl}
                      alt="Product preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-emerald-400 font-mono truncate">
                      Cloudinary CDN
                    </div>
                    <div className="text-2xs text-sushi-text-dim truncate font-mono mt-0.5">
                      {imageUrl}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Button
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    Đổi ảnh
                  </Button>
                  <Button
                    size="small"
                    danger
                    icon={<Trash size={14} />}
                    onClick={handleRemoveImage}
                  />
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-sushi-border/80 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 bg-sushi-surface/40 hover:bg-sushi-surface/80 group select-none"
              >
                {uploading ? (
                  <div className="flex flex-col items-center justify-center space-y-2 py-2">
                    <Spin size="small" />
                    <span className="text-xs text-sushi-text-dim font-mono">Đang tải ảnh lên Cloudinary...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ImageSquare size={22} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-sushi-text group-hover:text-blue-400 transition-colors">
                        Bấm để tải ảnh lên
                      </span>
                      <p className="text-2xs text-sushi-text-dim mt-0.5">PNG, JPG, WEBP tối đa 5MB</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Form.Item>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-sushi-border/80">
          <Button onClick={handleModalClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            className="bg-blue-600 hover:bg-blue-500 font-semibold px-6"
          >
            Lưu Hàng Hóa
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
