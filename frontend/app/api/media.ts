import { BaseResponse } from "@/types/base";
import { CreateMediaResponse, MediaMetadata } from "@/types/media";
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

  // 获取 media 的 matadata
  getMediaMetadata: (hash: string) => {
    return http.post<BaseResponse<MediaMetadata>>(`/artwork/media/${hash}/info`);
  },
};
