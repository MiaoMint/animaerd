import { BaseResponse } from "@/types/base";
import { http } from "@/utils/request";

export const artworkApi = {
  getArtworks: ({
    page,
    pageSize,
    username,
    isLiked,
  }: {
    page: number;
    pageSize: number;
    username?: string;
    isLiked?: boolean;
  }) =>
    http.get<BaseResponse<ArtworkResponse[]>>(`/artwork`, {
      pageSize,
      page,
      username,
      isLiked,
    }),

  getArtworkById: (id: number) =>
    http.get<BaseResponse<ArtworkResponse>>(`/artwork/${id}`),

  createArtwork: (data: CreateArtworkRequest) =>
    http.post<BaseResponse<number>>(`/artwork`, data),

  likeArtwork: (id: number) =>
    http.post<BaseResponse<number>>(`/artwork/${id}/like`),

  unlikeArtwork: (id: number) =>
    http.delete<BaseResponse<number>>(`/artwork/${id}/like`),

  getArtworkLikeStatus: (id: number) =>
    http.get<BaseResponse<boolean>>(`/artwork/${id}/like`),
};
