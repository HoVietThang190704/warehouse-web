import { UserRole } from '@/types/auth';

export interface Employee {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  branchId: string | null;
  warehouseId: string | null;
  warehouseName?: string | null;
  warehouseCode?: string | null;
  branchName?: string | null;
  branchCode?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateEmployeeInput {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  warehouseId?: string;
}

export interface UpdateEmployeeInput {
  fullName?: string;
  role?: UserRole;
  warehouseId?: string | null;
}

export interface ResetPasswordInput {
  newPassword: string;
}
