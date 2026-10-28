import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  ResetPasswordInput,
} from '../types';
import { message } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
};

export function useEmployees(enabled: boolean = true) {
  return useQuery({
    queryKey: employeeKeys.lists(),
    queryFn: employeesApi.getEmployees,
    staleTime: 60 * 1000,
    enabled,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateEmployeeInput) => employeesApi.createEmployee(data),
    onSuccess: () => {
      message.success(t('employees.createSuccess'));
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeInput }) =>
      employeesApi.updateEmployee(id, data),
    onSuccess: () => {
      message.success(t('employees.updateSuccess'));
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
}

export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      employeesApi.updateStatus(id, isActive),
    onSuccess: () => {
      message.success(t('employees.statusSuccess'));
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
}

export function useResetEmployeePassword() {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResetPasswordInput }) =>
      employeesApi.resetPassword(id, data),
    onSuccess: () => {
      message.success(t('employees.resetSuccess'));
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
}
