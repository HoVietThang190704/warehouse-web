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
  ImageSquare,
  Trash,
  Spin,
  message,
} from '@/components/ui';
import { CreateProductInput } from '../types';
import { createProductSchema } from '../schemas/catalog.schema';
import { catalogApi } from '../api/catalog.api';
import { createZodRule } from '@/lib/zod-validator';
import { useCategoryOptions, useUnitOptions } from '../hooks/use-categories';
import { useTranslation } from '@/lib/i18n';

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
      setImageUrl(result.url);
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
    setImageUrl('');
    form.setFieldValue('imageUrl', '');
  };

  const handleSubmit = async (values: unknown) => {
    setSubmitting(true);

    const result = createProductSchema.safeParse(values);
    if (!result.success) {
      message.error(result.error.issues[0]?.message || t('products.invalidData'));
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
      title={t('products.createTitle')}
      open={open}
      onCancel={handleModalClose}
      footer={null}
      destroyOnHidden
      width={580}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ minStock: 5, costPrice: 0, sellingPrice: 0, initialQuantity: 0 }}
      >
        {/* Tên hàng */}
        <Form.Item
          name="name"
          label={t('products.nameLabel')}
          rules={[createZodRule(createProductSchema, 'name')]}
        >
          <Input placeholder={t('products.namePlaceholder')} />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mã SKU */}
          <Form.Item
            name="sku"
            label={t('products.skuLabel')}
            rules={[createZodRule(createProductSchema, 'sku')]}
          >
            <Input placeholder={t('products.skuPlaceholder')} className="uppercase font-mono" />
          </Form.Item>

          {/* Barcode */}
          <Form.Item
            name="barcode"
            label={t('products.barcodeLabel')}
          >
            <Input placeholder={t('products.barcodePlaceholder')} className="font-mono" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nhóm hàng */}
          <Form.Item
            name="categoryId"
            label={t('products.categoryLabel')}
          >
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
          >
            <Select
              placeholder={t('products.unitPlaceholder')}
              allowClear
              options={unitOptions}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Giá vốn */}
          <Form.Item
            name="costPrice"
            label={t('products.costPriceLabel')}
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
            label={t('products.sellingPriceLabel')}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Số lượng tồn ban đầu */}
          <Form.Item
            name="initialQuantity"
            label={
              <span className="text-emerald-400 font-medium">
                {t('products.initialStockLabel')}
              </span>
            }
            rules={[createZodRule(createProductSchema, 'initialQuantity')]}
            tooltip={t('products.initialStockTooltip')}
          >
            <InputNumber<number>
              style={{ width: '100%' }}
              min={0}
              placeholder="0"
              formatter={(val) => (val ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0')}
              parser={(val) => (val ? Number(val.replace(/,/g, '')) : 0)}
            />
          </Form.Item>

          {/* Ngưỡng cảnh báo tồn tối thiểu */}
          <Form.Item
            name="minStock"
            label={
              <span className="text-amber-400 font-medium">
                {t('products.minStockLabel')}
              </span>
            }
            rules={[createZodRule(createProductSchema, 'minStock')]}
            tooltip={t('products.minStockTooltip')}
          >
            <InputNumber<number>
              style={{ width: '100%' }}
              min={0}
              placeholder="5"
            />
          </Form.Item>
        </div>

        {/* Upload Ảnh */}
        <Form.Item
          name="imageUrl"
          label={t('products.imageLabel')}
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
                    {t('dashboard.edit')}
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
                    <span className="text-xs text-sushi-text-dim font-mono">{t('products.uploading')}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ImageSquare size={22} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-sushi-text group-hover:text-blue-400 transition-colors">
                        {t('products.uploadImage')}
                      </span>
                      <p className="text-2xs text-sushi-text-dim mt-0.5">{t('products.imageHelp')}</p>
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
            {t('common.cancel')}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            className="bg-blue-600 hover:bg-blue-500 font-semibold px-6"
          >
            {t('common.create')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
