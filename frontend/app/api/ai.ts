import { GenerateTextToImageRequest } from "@/types/ai";
import { BaseResponse } from "@/types/base";
import { CreateMediaResponse } from "@/types/media";
import { http } from "@/utils/request";

export const aiApi = {
  text2image: (request: GenerateTextToImageRequest) =>
    http.post<BaseResponse<CreateMediaResponse | null>>(
      "/ai/text2image",
      request
    ),
};
