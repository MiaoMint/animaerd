import { BaseResponse } from "@/types/base";
import { http } from "@/utils/request";

export const styleApi = {
  getStyles: () => 
    http.get<BaseResponse<StyleResponse[]>>("/style"),

  getStyle: (id: number) =>
    http.get<BaseResponse<StyleResponse>>(`/style/${id}`),

  createStyle: (data: FormData) =>
    http.post<BaseResponse<StyleResponse>>("/style", data),

  updateStyle: (id: number, data: UpdateStyleRequest) =>
    http.put<BaseResponse<StyleResponse>>(`/style/${id}`, data),

  updateStyleIcon: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return http.put<BaseResponse<null>>(`/style/${id}/icon`, formData);
  },

  deleteStyle: (id: number) =>
    http.delete<BaseResponse<null>>(`/style/${id}`),
};
