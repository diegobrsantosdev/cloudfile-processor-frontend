import { Component, computed, DestroyRef, HostListener, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval } from 'rxjs';
import { UploadConfirmDialog } from '../../components/upload-confirm-dialog/upload-confirm-dialog';
import { FileItem, FileStatus } from '../../models/file-item';
import { FileService } from '../../services/file.service';

// Limit of a single upload to S3 (5 GiB). Larger files would need multipart upload.
const MAX_FILE_SIZE = 5 * 1024 ** 3;

const STATUS_HELP: Record<FileStatus, string> = {
  PENDING: 'Received and waiting in line to be processed.',
  PROCESSING: 'Being processed right now.',
  COMPLETED: 'Done. Your file is stored and ready.',
  FAILED: 'Something went wrong while processing. Try uploading the file again.',
  DELETED: 'This file was deleted.',
};

@Component({
  selector: 'app-file-list',
  imports: [DatePipe, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './file-list.html',
  styleUrl: './file-list.css',
})
export class FileList implements OnInit {
  private readonly fileService = inject(FileService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  // Keep polling until this timestamp, even if nothing looks "in progress"
  private pollingUntil = 0;

  protected readonly statusHelp = STATUS_HELP;

  files = signal<FileItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  uploading = signal(false);
  uploadProgress = signal(0);
  uploadingName = signal('');

  // True while at least one file is still being processed
  hasInProgress = computed(() =>
    this.files().some((f) => f.status === 'PENDING' || f.status === 'PROCESSING'),
  );

  ngOnInit(): void {
    this.loadFiles();

    interval(3000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.hasInProgress() || Date.now() < this.pollingUntil) {
          this.loadFiles();
        }
      });
  }

  // Asks the browser to confirm before leaving the page in the middle of an upload
  @HostListener('window:beforeunload', ['$event'])
  protected warnBeforeLeaving(event: BeforeUnloadEvent): void {
    if (this.uploading()) {
      event.preventDefault();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // allows choosing the same file again later

    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      this.snackBar.open(
        'This file is larger than 5 GB, the maximum for a single upload.',
        'OK',
        { duration: 6000 },
      );
      return;
    }

    this.dialog
      .open(UploadConfirmDialog, {
        width: '420px',
        data: {
          fileName: file.name,
          fileType: file.type || 'Unknown type',
          fileSize: this.formatSize(file.size),
        },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (confirmed) {
          this.upload(file);
        }
      });
  }

  retry(): void {
    this.loading.set(true);
    this.loadFiles();
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) {
      return bytes + ' B';
    }
    if (bytes < 1024 * 1024) {
      return Math.round(bytes / 1024) + ' KB';
    }
    if (bytes < 1024 ** 3) {
      return (bytes / 1024 ** 2).toFixed(1) + ' MB';
    }
    return (bytes / 1024 ** 3).toFixed(2) + ' GB';
  }

  private upload(file: File): void {
    this.uploading.set(true);
    this.uploadProgress.set(0);
    this.uploadingName.set(file.name);

    this.fileService.upload(file).subscribe({
      next: (progress) => this.uploadProgress.set(progress),
      complete: () => {
        this.uploading.set(false);
        this.snackBar.open(`"${file.name}" uploaded successfully.`, 'OK', {
          duration: 5000,
        });
        this.pollingUntil = Date.now() + 60_000; // check the list for 60s
        this.loadFiles();
      },
      error: () => {
        this.uploading.set(false);
        this.snackBar.open('Upload failed. Check your connection and try again.', 'OK', {
          duration: 6000,
        });
      },
    });
  }

  private loadFiles(): void {
    this.fileService.list().subscribe({
      next: (files) => {
        // Most recent first
        this.files.set([...files].sort((a, b) => b.uploadDate.localeCompare(a.uploadDate)));
        this.error.set(null);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("We couldn't load your files. Check your connection and try again.");
        this.loading.set(false);
      },
    });
  }
}