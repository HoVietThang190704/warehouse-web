export type UserRole =
  | 'SUPER_ADMIN'
  | 'WAREHOUSE_MANAGER'
  | 'WAREHOUSE_STAFF';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  branchId: string | null;
  warehouseId?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: UserProfile;
  tokens: AuthTokens;
}
