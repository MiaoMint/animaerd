import { BaseResponse } from "@/types/base";
import { http } from "@/utils/request";

export const artworkApi = {
  getArtworks: (page: number, pageSize: number, username?: string) =>
    http.get<BaseResponse<ArtworkResponse[]>>(`/artwork`, {
      pageSize,
      page,
      username,
    }),

  getArtworkById: (id: number) =>
    http.get<BaseResponse<ArtworkResponse>>(`/artwork/${id}`),

  createArtwork: (data: CreateArtworkRequest) =>
    http.post<BaseResponse<number>>(`/artwork`, data),
};
