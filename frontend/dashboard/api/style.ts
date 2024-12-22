import { BaseResponse } from "@/types/base";
import { http } from "@/utils/request";

export const styleApi = {
  // Get user by ID
  getStyles: () => http.get<BaseResponse<UserResponse>>(`/style`),

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
