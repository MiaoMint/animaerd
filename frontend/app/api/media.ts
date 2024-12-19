import { BaseResponse } from "@/types/base";
import { http } from "@/utils/request";

export const mediaApi = {
  uploadImage: (hash?: string, file?: File) => {
    const formData = new FormData();
    if (hash) {
      formData.append("hash", hash);
    }
    if (file) {
      formData.append("file", file);
    }
    return http.post<BaseResponse<CreateMediaResponse>>(
      `/artwork/media`,
      formData
    );
  },
};
