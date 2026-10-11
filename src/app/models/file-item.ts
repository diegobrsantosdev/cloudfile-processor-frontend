export type FileStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DELETED';

export interface FileItem {
  fileId: string;
  fileName: string;
  status: FileStatus;
  sizeInBytes: number;
  uploadDate: string;
  updatedAt: string;
}