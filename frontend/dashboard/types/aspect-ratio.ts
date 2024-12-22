interface AspectRatio {
  id: number;
  ratio: string;
  width: number;
  height: number;
}

interface CreateAspectRatioRequest {
  ratio: string;
  width: number;
  height: number;
}

interface UpdateAspectRatioRequest {
  ratio?: string;
  width?: number;
  height?: number;
}
