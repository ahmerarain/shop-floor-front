// User and Authentication Types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role: "admin" | "user";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
  message: string;
}

export interface ProfileResponse {
  success: boolean;
  user: User;
}

// User Management Types
export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  is_active: boolean;
  send_email: boolean;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  is_active?: boolean;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserResponse {
  success: boolean;
  user: User;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}
