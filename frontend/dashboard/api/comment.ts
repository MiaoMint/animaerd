import { BaseResponse } from "@/types/base";
import { http } from "@/utils/request";

export const commentApi = {
  getComments: (artworkId: number) =>
    http.get<BaseResponse<CommentResponse[]>>(`/artwork/${artworkId}/comments`),

  getCommentsByChild: (artworkId: number, commentId: number) =>
    http.get<BaseResponse<CommentResponse[]>>(
      `/artwork/${artworkId}/comments/${commentId}`
    ),

  createComment: (artworkId: number, data: CreateCommentRequest) =>
    http.post<BaseResponse<number>>(`/artwork/${artworkId}/comment`, data),

  replyComment: (
    artworkId: number,
    commentId: number,
    data: CreateCommentRequest
  ) =>
    http.post<BaseResponse<number>>(
      `/artwork/${artworkId}/comment/${commentId}`,
      data
    ),
};
