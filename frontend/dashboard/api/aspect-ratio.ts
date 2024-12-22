import { BaseResponse } from "@/types/base";
import { http } from "@/utils/request";

export const getAspectRatios = () =>
  http.get<BaseResponse<AspectRatio[] | null>>("/aspectratio");

export const getAspectRatio = (id: number) =>
  http.get<BaseResponse<AspectRatio>>(`/aspectratio/${id}`);

export const createAspectRatio = (data: CreateAspectRatioRequest) =>
  http.post<BaseResponse<AspectRatio>>("/aspectratio", data);

export const updateAspectRatio = (id: number, data: UpdateAspectRatioRequest) =>
  http.put<BaseResponse<AspectRatio>>(`/aspectratio/${id}`, data);

export const deleteAspectRatio = (id: number) =>
  http.delete<BaseResponse<null>>(`/aspectratio/${id}`);
