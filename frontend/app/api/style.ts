import { BaseResponse } from "@/types/base";
import { http } from "@/utils/request";

export const styleApi = {
  getStyles: () => http.get<BaseResponse<StyleResponse[]>>("/style"),
};
