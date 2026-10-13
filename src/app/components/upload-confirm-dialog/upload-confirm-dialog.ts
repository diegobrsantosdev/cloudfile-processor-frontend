import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface UploadConfirmData {
  fileName: string;
  fileType: string;
  fileSize: string;
}

@Component({
  selector: 'app-upload-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Upload this file?</h2>

    <mat-dialog-content>
      <div class="file-info">
        <mat-icon>insert_drive_file</mat-icon>
        <div>
          <div class="name">{{ data.fileName }}</div>
          <div class="meta">{{ data.fileType }} · {{ data.fileSize }}</div>
        </div>
      </div>

      <p class="note">It will be uploaded securely and processed automatically.</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-flat-button [mat-dialog-close]="true">Upload</button>
    </mat-dialog-actions>
  `,
  styles: `
    .file-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .name {
      font-weight: 600;
      word-break: break-all;
    }
    .meta {
      font-size: 0.85rem;
      opacity: 0.7;
    }
    .note {
      margin: 1rem 0 0;
      font-size: 0.9rem;
      opacity: 0.75;
    }
  `,
})
export class UploadConfirmDialog {
  protected readonly data = inject<UploadConfirmData>(MAT_DIALOG_DATA);
}