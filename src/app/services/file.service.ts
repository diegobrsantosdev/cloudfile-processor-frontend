import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { FileDownloadResponse, FileItem } from '../models/file-item';
import { FileUploadRequest, FileUploadResponse } from '../models/file-upload';
import { UploadError } from '../utils/api-error';

@Injectable({ providedIn: 'root' })
export class FileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = APP_CONFIG.apiBaseUrl;

  list(): Observable<FileItem[]> {
    return this.http.get<FileItem[]>(`${this.baseUrl}/files`);
  }

  /** Every file the user ever uploaded, including deleted ones. */
  history(): Observable<FileItem[]> {
    return this.http.get<FileItem[]>(`${this.baseUrl}/files/history`);
  }

  /** Asks the API for a temporary download link for a file. */
  getDownloadUrl(fileId: string): Observable<string> {
    return this.http
      .get<FileDownloadResponse>(`${this.baseUrl}/files/${fileId}`)
      .pipe(map((res) => res.preSignedUrl));
  }

  delete(fileId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/files/${fileId}`);
  }

  /** Emits the upload progress (0-100) and completes when the file has been stored. */
  upload(file: File): Observable<number> {
    const body: FileUploadRequest = {
      originalFileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeInBytes: file.size,
    };

    return this.http
      .post<FileUploadResponse>(`${this.baseUrl}/files`, body)
      .pipe(switchMap((res) => this.putWithProgress(res.preSignedUrl, file)));
  }

  /**
   * Sends the file straight to S3 using XMLHttpRequest, because it is the browser API
   * that reports upload progress (fetch does not).
   */
  private putWithProgress(url: string, file: File): Observable<number> {
    return new Observable<number>((subscriber) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      if (file.type) {
        xhr.setRequestHeader('Content-Type', file.type);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          subscriber.next(Math.round((100 * event.loaded) / event.total));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          subscriber.next(100);
          subscriber.complete();
        } else {
          subscriber.error(new UploadError(xhr.status));
        }
      };

      xhr.onerror = () => subscriber.error(new UploadError(0));
      xhr.onabort = () => subscriber.error(new UploadError(0));

      xhr.send(file);

      // Cancels the request if nobody is listening anymore
      return () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
          xhr.abort();
        }
      };
    });
  }
}