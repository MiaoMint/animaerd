import { BaseResponse } from "@/types/base";
import { CreateTagRequest, TagResponse, UpdateTagRequest } from "@/types/tag";
import { http } from "@/utils/request";

export const tagApi = {
  getTagList: () => http.get<BaseResponse<TagResponse[]>>("/tag"),
  createTag: (data: CreateTagRequest) =>
    http.post<BaseResponse<TagResponse>>("/tag", data),
  updateTag: (id: number, data: UpdateTagRequest) =>
    http.put<BaseResponse<TagResponse>>(`/tag/${id}`, data),
  deleteTag: (id: number) => http.delete<BaseResponse<null>>(`/tag/${id}`),
};
