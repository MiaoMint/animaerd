import { BaseResponse } from "@/types/base";
import { http } from "@/utils/request";

export const dashboardApi = {
  getTotalUsers: () =>
    http.get<BaseResponse<number>>("/admin/dashboard/total-users"),
  getCommentGenerates: () =>
    http.get<BaseResponse<number>>("/admin/dashboard/total-comment-generates"),
  getArtworks: () =>
    http.get<BaseResponse<number>>("/admin/dashboard/total-artworks"),
  getRecentThreeMonthsData: () =>
    http.get<
      BaseResponse<
        {
          date: string;
          user: number;
          generate: number;
        }[]
      >
    >("/admin/dashboard/recent-three-month"),
};
