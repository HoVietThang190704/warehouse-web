'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Switch,
  ImageSquare,
  Trash,
  Spin,
  LockSimple,
  message,
} from '@/components/ui';
import { Product, UpdateProductInput } from '../types';
import { updateProductSchema } from '../schemas/catalog.schema';
import { catalogApi } from '../api/catalog.api';
import { createZodRule } from '@/lib/zod-validator';
import { useCategoryOptions, useUnitOptions } from '../hooks/use-categories';
import { useTranslation } from '@/lib/i18n';

interface EditProductModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSubmit: (id: string, dto: UpdateProductInput) => Promise<unknown>;
}

export function EditProductModal({
  open,
  product,
  onClose,
  onSubmit,
}: EditProductModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const watchedImageUrl = Form.useWatch('imageUrl', form);
  const imageUrl = watchedImageUrl ?? product?.imageUrl ?? '';

  const { options: categoryOptions } = useCategoryOptions();
  const { options: unitOptions } = useUnitOptions();

  // Kiểm tra xem sản phẩm đã phát sinh giao dịch/tồn kho chưa
  const hasInventoryHistory = Boolean(
    product?.stockBalances && product.stockBalances.length > 0,
  );

  useEffect(() => {
    if (product && open) {
      form.setFieldsValue({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || '',
        categoryId: product.categoryId || undefined,
        baseUnitId: product.baseUnitId || product.baseUnit?.id || undefined,
        minStock: Number(product.minStock ?? 5),
        costPrice: Number(product.costPrice ?? 0),
        sellingPrice: Number(product.sellingPrice ?? 0),
        imageUrl: product.imageUrl || '',
        isActive: product.isActive !== undefined ? product.isActive : true,
      });
    }
  }, [product, open, form]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error(t('products.imageFormatError'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error(t('products.imageSizeError'));
      return;
    }

    try {
      setUploading(true);
      const result = await catalogApi.uploadImage(file);
      form.setFieldValue('imageUrl', result.url);
      message.success(t('products.imageUploadSuccess'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('products.imageFormatError');
      message.error(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    form.setFieldValue('imageUrl', '');
  };

  const handleSubmit = async (values: unknown) => {
    if (!product) return;
    setSubmitting(true);

    const result = updateProductSchema.safeParse(values);
    if (!result.success) {
      message.error(result.error.issues[0]?.message || t('products.invalidData'));
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit(product.id, result.data);
      form.resetFields();
      onClose();
    } catch {
      // Handled in mutation hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={t('products.editTitle')}
      open={open}
      onCancel={handleModalClose}
      footer={null}
      destroyOnHidden
      width={600}
      centered
    >
      {hasInventoryHistory && (
        <div className="mb-4 p-3.5 rounded-xl bg-blue-500/15 border border-blue-500/40 flex items-start gap-3 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-blue-500/25 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <LockSimple size={16} weight="bold" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-blue-300">Khóa SKU và Đơn vị tính cơ sở</h4>
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
              Mặt hàng này đã phát sinh giao dịch tồn kho. Để đảm bảo tính toàn vẹn của sổ cái, hệ thống khóa mã SKU và đơn vị tính cơ sở.
            </p>
          </div>
        </div>
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Tên hàng */}
        <Form.Item
          name="name"
          label={t('products.nameLabel')}
          rules={[createZodRule(updateProductSchema, 'name')]}
        >
          <Input placeholder={t('products.namePlaceholder')} />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mã SKU */}
          <Form.Item
            name="sku"
            label={t('products.skuLabel')}
            tooltip={
              hasInventoryHistory
                ? 'Không thể sửa vì đã có dữ liệu nhập/xuất kho'
                : 'Mã định danh duy nhất của hàng hóa'
            }
          >
            <Input
              disabled={hasInventoryHistory}
              placeholder="SP-001"
              className="uppercase font-mono !text-slate-200 !bg-slate-900/90 !border-slate-700"
              suffix={hasInventoryHistory ? <LockSimple size={14} className="text-slate-400" /> : undefined}
            />
          </Form.Item>

          {/* Barcode */}
          <Form.Item name="barcode" label={t('products.barcodeLabel')}>
            <Input placeholder={t('products.barcodePlaceholder')} className="font-mono" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nhóm hàng */}
          <Form.Item name="categoryId" label={t('products.categoryLabel')}>
            <Select
              placeholder={t('products.categoryPlaceholder')}
              allowClear
              options={categoryOptions}
            />
          </Form.Item>

          {/* Đơn vị tính */}
          <Form.Item
            name="baseUnitId"
            label={t('products.unitLabel')}
            tooltip={
              hasInventoryHistory
                ? 'Không thể sửa vì đã có dữ liệu nhập/xuất kho'
                : 'Đơn vị tính lưu kho'
            }
          >
            <Select
              disabled={hasInventoryHistory}
              placeholder={t('products.unitPlaceholder')}
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
                {t('products.minStockLabel')}
              </span>
            }
            tooltip={t('products.minStockTooltip')}
          >
            <InputNumber<number> style={{ width: '100%' }} min={0} placeholder="5" />
          </Form.Item>

          {/* Giá vốn */}
          <Form.Item name="costPrice" label={t('products.costPriceLabel')}>
            <InputNumber<number>
              style={{ width: '100%' }}
              min={0}
              step={5000}
              formatter={(val) =>
                val ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
              }
              parser={(val) => (val ? Number(val.replace(/,/g, '')) : 0)}
              placeholder="0"
            />
          </Form.Item>

          {/* Giá bán */}
          <Form.Item name="sellingPrice" label={t('products.sellingPriceLabel')}>
            <InputNumber<number>
              style={{ width: '100%' }}
              min={0}
              step={5000}
              formatter={(val) =>
                val ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
              }
              parser={(val) => (val ? Number(val.replace(/,/g, '')) : 0)}
              placeholder="0"
            />
          </Form.Item>
        </div>

        {/* Trạng thái hoạt động */}
        <Form.Item
          name="isActive"
          label={t('common.status')}
          valuePropName="checked"
        >
          <div className="flex items-center space-x-3">
            <Switch defaultChecked />
            <span className="text-xs text-sushi-text-muted">
              {t('common.active')}
            </span>
          </div>
        </Form.Item>

        {/* Upload Ảnh */}
        <Form.Item name="imageUrl" label={t('products.imageLabel')}>
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {imageUrl ? (
              <div className="p-3 rounded-2xl bg-sushi-surface border border-sushi-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
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
                className="border-2 border-dashed border-sushi-border/80 hover:border-blue-500 rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 bg-sushi-surface/40 hover:bg-sushi-surface/80 group select-none"
              >
                {uploading ? (
                  <div className="flex flex-col items-center justify-center space-y-2 py-2">
                    <Spin size="small" />
                    <span className="text-xs text-sushi-text-dim font-mono">
                      Đang tải ảnh lên Cloudinary...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ImageSquare size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-sushi-text group-hover:text-blue-400 transition-colors">
                        Bấm để tải ảnh lên
                      </span>
                      <p className="text-2xs text-sushi-text-dim mt-0.5">
                        PNG, JPG, WEBP tối đa 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Form.Item>

        {/* Modal Actions */}
        <div className="sticky bottom-0 bg-sushi-card/95 backdrop-blur-md pt-3.5 pb-1 -mx-2 px-2 mt-4 border-t border-sushi-border/80 flex items-center justify-end space-x-3 z-10">
          <Button onClick={handleModalClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            className="bg-blue-600 hover:bg-blue-500 font-semibold px-6"
          >
            Lưu Thay Đổi
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
