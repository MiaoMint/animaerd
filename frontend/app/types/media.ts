export interface CreateMediaResponse {
  hash: string;
  url: string;
}

export interface MediaMetadata {
  title: string;
  description: string;
  tags: string[];
}
