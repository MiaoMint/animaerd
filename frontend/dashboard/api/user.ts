import { BaseResponse } from "@/types/base";
import { http } from "@/utils/request";

export const userApi = {
  // Get user by ID
  getUserById: (id: number) =>
    http.get<BaseResponse<UserResponse>>(`/user/${id}`),

  // Update user profile
  updateUser: (data: UpdateUserRequest) =>
    http.put<BaseResponse<UserResponse>>("/user", data),

  // Upload user avatar
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return http.put<BaseResponse<UserResponse>>("/user/avatar", formData);
  },
};
