import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  authApi,
  userApi,
  LoginResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  UpdatePasswordResponse,
  ProfileResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UsersResponse,
  UserResponse,
} from "../services/api";
import { toast } from "sonner";

// Authentication hooks
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (response) => {
      const data: LoginResponse = response.data;
      if (data.success) {
        queryClient.setQueryData(["auth", "profile"], data.user);
        toast.success("Login successful!");
      }
    },
    onError: (error: any) => {
      toast.error("Login failed", {
        description: error.response?.data?.error || "Invalid credentials",
      });
    },
  });
};

export const useForgotPassword = (callback?: () => void) => {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: (response) => {
      const data: ForgotPasswordResponse = response.data;
      if (data.success) {
        toast.success("Password reset link sent to your email");
        callback?.();
      }
    },
    onError: (error: any) => {
      toast.error("Failed to send reset email", {
        description: error.response?.data?.error || "Please try again",
      });
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => authApi.resetPassword(token, newPassword),
    onSuccess: (response) => {
      const data: ResetPasswordResponse = response.data;
      if (data.success) {
        toast.success("Password reset successfully");
      }
    },
    onError: (error: any) => {
      toast.error("Password reset failed", {
        description: error.response?.data?.error || "Invalid or expired token",
      });
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => authApi.updatePassword(currentPassword, newPassword),
    onSuccess: (response) => {
      const data: UpdatePasswordResponse = response.data;
      if (data.success) {
        toast.success("Password updated successfully");
      }
    },
    onError: (error: any) => {
      toast.error("Password update failed", {
        description:
          error.response?.data?.error || "Current password is incorrect",
      });
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ["auth", "profile"],
    queryFn: () => authApi.getProfile(),
    select: (response): ProfileResponse => response.data,
    enabled: !!localStorage.getItem("authToken"),
  });
};

// User Management hooks
export const useUsers = (
  page: number = 1,
  limit: number = 100,
  search: string = ""
) => {
  return useQuery({
    queryKey: ["users", page, limit, search],
    queryFn: () => userApi.getUsers(page, limit, search),
    select: (response): UsersResponse => response.data,
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => userApi.getUserById(id),
    select: (response): UserResponse => response.data,
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => userApi.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to create user", {
        description: error.response?.data?.error || "Please try again",
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      userData,
    }: {
      id: number;
      userData: UpdateUserRequest;
    }) => userApi.updateUser(id, userData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update user", {
        description: error.response?.data?.error || "Please try again",
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to delete user", {
        description: error.response?.data?.error || "Please try again",
      });
    },
  });
};
