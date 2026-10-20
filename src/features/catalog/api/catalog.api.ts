import { fetchApi, getApiBaseUrl } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { Category, CreateCategoryInput, Product, CreateProductInput, Unit } from '../types';

export const catalogApi = {
  /**
   * Lấy danh sách nhóm hàng hóa
   */
  getCategories: async (): Promise<Category[]> => {
    return fetchApi<Category[]>(API_ENDPOINTS.CATALOG.CATEGORIES);
  },

  /**
   * Lấy danh sách đơn vị tính
   */
  getUnits: async (): Promise<Unit[]> => {
    return fetchApi<Unit[]>(API_ENDPOINTS.CATALOG.UNITS);
  },

  /**
   * Tạo nhóm hàng mới
   */
  createCategory: async (dto: CreateCategoryInput): Promise<Category> => {
    return fetchApi<Category>(API_ENDPOINTS.CATALOG.CATEGORIES, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Lấy danh sách sản phẩm hàng hóa
   */
  getProducts: async (categoryId?: string, search?: string): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (search) params.append('search', search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<Product[]>(`${API_ENDPOINTS.CATALOG.PRODUCTS}${queryString}`);
  },

  /**
   * Lấy chi tiết 1 hàng hóa theo ID
   */
  getProductById: async (id: string): Promise<Product> => {
    return fetchApi<Product>(API_ENDPOINTS.CATALOG.PRODUCT_BY_ID(id));
  },

  /**
   * Tạo hàng hóa mới
   */
  createProduct: async (dto: CreateProductInput): Promise<Product> => {
    return fetchApi<Product>(API_ENDPOINTS.CATALOG.PRODUCTS, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Tải ảnh lên Cloudinary qua Catalog Service
   */
  uploadImage: async (file: File): Promise<{ url: string; publicId: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}${API_ENDPOINTS.CATALOG.UPLOAD}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error?.message || data?.message || 'Tải ảnh lên Cloudinary thất bại');
    }
    return (data?.data || data) as { url: string; publicId: string };
  },
};
