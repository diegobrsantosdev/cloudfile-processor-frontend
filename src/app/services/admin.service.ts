import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { FileItem } from '../models/file-item';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${APP_CONFIG.apiBaseUrl}/admin/files`;

  /** Ids of every user that has files. */
  listUsers(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/users`);
  }

  /** Every file of a user, including deleted ones. */
  listUserFiles(userId: string): Observable<FileItem[]> {
    return this.http.get<FileItem[]>(`${this.baseUrl}/users/${userId}`);
  }

  reprocess(fileId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${fileId}/reprocess`, null);
  }

  delete(fileId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${fileId}`);
  }
}