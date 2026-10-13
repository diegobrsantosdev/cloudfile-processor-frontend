import { FileStatus } from './file-item';

export interface FileUploadRequest {
  originalFileName: string;
  mimeType: string;
  sizeInBytes: number;
}

export interface FileUploadResponse {
  uploadId: string;
  s3Key: string;
  preSignedUrl: string;
  expiresAt: string;
  status: FileStatus;
}