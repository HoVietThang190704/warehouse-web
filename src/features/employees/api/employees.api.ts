import { fetchApi } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import {
  Employee,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  ResetPasswordInput,
} from '../types';

export const employeesApi = {
  getEmployees: async (): Promise<Employee[]> => {
    return fetchApi<Employee[]>(API_ENDPOINTS.USERS.LIST);
  },

  createEmployee: async (dto: CreateEmployeeInput): Promise<Employee> => {
    return fetchApi<Employee>(API_ENDPOINTS.USERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  updateEmployee: async (
    id: string,
    dto: UpdateEmployeeInput,
  ): Promise<Employee> => {
    return fetchApi<Employee>(API_ENDPOINTS.USERS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  updateStatus: async (
    id: string,
    isActive: boolean,
  ): Promise<Employee> => {
    return fetchApi<Employee>(API_ENDPOINTS.USERS.STATUS(id), {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  resetPassword: async (
    id: string,
    dto: ResetPasswordInput,
  ): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(
      API_ENDPOINTS.USERS.RESET_PASSWORD(id),
      {
        method: 'POST',
        body: JSON.stringify(dto),
      },
    );
  },
};
