import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Vui lòng nhập tên danh mục!')
    .min(2, 'Tên danh mục phải có ít nhất 2 ký tự')
    .max(100, 'Tên danh mục không được vượt quá 100 ký tự'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const createProductSchema = z.object({
  sku: z
    .string()
    .min(1, 'SKU không được để trống')
    .max(60, 'SKU không được vượt quá 60 ký tự'),
  barcode: z.string().max(100).optional(),
  name: z
    .string()
    .min(2, 'Tên hàng hóa phải có ít nhất 2 ký tự')
    .max(160, 'Tên hàng hóa không được vượt quá 160 ký tự'),
  categoryId: z.string().uuid('Category ID phải là UUID hợp lệ').optional(),
  baseUnitId: z.string().uuid('Đơn vị tính phải là UUID hợp lệ').optional(),
  minStock: z.coerce.number().min(0, 'Ngưỡng tồn tối thiểu phải >= 0').default(5),
  costPrice: z.coerce.number().min(0, 'Giá vốn phải >= 0').default(0),
  sellingPrice: z.coerce.number().min(0, 'Giá bán phải >= 0').default(0),
  initialQuantity: z.coerce.number().min(0, 'Số lượng ban đầu phải >= 0').default(0),
  warehouseId: z.string().uuid('Warehouse ID phải là UUID hợp lệ').optional(),
  imageUrl: z.string().optional().or(z.literal('')),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Vui lòng nhập tên danh mục!')
    .min(2, 'Tên danh mục phải có ít nhất 2 ký tự')
    .max(100, 'Tên danh mục không được vượt quá 100 ký tự'),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên hàng hóa phải có ít nhất 2 ký tự')
    .max(160, 'Tên hàng hóa không được vượt quá 160 ký tự'),
  sku: z.string().max(60).optional(),
  barcode: z.string().max(100).optional().or(z.literal('')),
  categoryId: z.string().uuid().optional().or(z.literal('')),
  baseUnitId: z.string().uuid().optional().or(z.literal('')),
  minStock: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  sellingPrice: z.coerce.number().min(0).optional(),
  imageUrl: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
