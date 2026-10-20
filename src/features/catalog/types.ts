export type { CreateCategoryInput, CreateProductInput } from './schemas/catalog.schema';

export interface Unit {
  id: string;
  code: string;
  name: string;
  dimension?: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt?: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  sku: string;
  barcode?: string | null;
  name: string;
  categoryId?: string | null;
  category?: Category | null;
  baseUnitId?: string;
  baseUnit?: Unit | null;
  minStock: number | string;
  costPrice: number | string;
  sellingPrice: number | string;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stockBalances?: Array<{
    id: string;
    quantity: number | string;
    warehouse?: { name: string };
  }>;
}
