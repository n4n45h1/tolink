export interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string | ArrayBuffer | null;
  createdAt: number;
}

export interface FileLink {
  id: string;
  fileId: string;
  code: string;
  password?: string;
  downloadLimit?: number;
  downloads: number;
  expiresAt: number;
  createdAt: number;
}

export interface HCaptchaResponse {
  token: string;
  ekey: string;
}