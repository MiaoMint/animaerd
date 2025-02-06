import { BaseResponse } from "@/types/base";
import { PopularTagResponse } from "@/types/tag";
import { http } from "@/utils/request";

export const tagApi = {
  getPopularTags: () =>
    http.get<BaseResponse<PopularTagResponse[]>>(`/tag/popular`),
};
