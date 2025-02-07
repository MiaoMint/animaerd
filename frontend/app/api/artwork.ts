import { BaseResponse } from "@/types/base";
import { http } from "@/utils/request";

export const artworkApi = {
  getArtworks: ({
    page,
    pageSize,
    username,
    isLiked,
    commentGenerate,
  }: {
    page: number;
    pageSize: number;
    username?: string;
    isLiked?: boolean;
    commentGenerate?: boolean;
  }) =>
    http.get<BaseResponse<ArtworkResponse[]>>(`/artwork`, {
      pageSize,
      page,
      username,
      isLiked,
      commentGenerate,
    }),

  searchArtworks: ({
    page,
    pageSize,
    q,
    tags,
  }: {
    page: number;
    pageSize: number;
    q?: string;
    tags?: string;
  }) =>
    http.get<BaseResponse<ArtworkResponse[]>>(`/artwork/search`, {
      pageSize,
      page,
      q,
      tags,
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
