import { BaseResponse } from "@/types/base";
import { http } from "@/utils/request";

export const aspectRatioApi = {
  getAspectRatios: () =>
    http.get<BaseResponse<AspectRatio[] | null>>("/aspectratio"),
};
