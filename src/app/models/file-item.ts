export type FileStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DELETED';

export interface FileItem {
  uploadId: string;
  s3Key: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  status: FileStatus;
}

export interface FileDownloadResponse {
  fileId: string;
  fileName: string;
  preSignedUrl: string;
}