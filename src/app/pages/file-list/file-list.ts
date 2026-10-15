import { Component, computed, DestroyRef, HostListener, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { interval } from 'rxjs';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../components/confirm-dialog/confirm-dialog';
import { UploadConfirmDialog } from '../../components/upload-confirm-dialog/upload-confirm-dialog';
import { FileItem, FileStatus } from '../../models/file-item';
import { FileService } from '../../services/file.service';
import { errorMessage } from '../../utils/api-error';

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
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
  ],
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
  protected readonly columns = [
    'fileName',
    'fileType',
    'status',
    'fileSize',
    'uploadDate',
    'actions',
  ];

  files = signal<FileItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  search = signal('');
  sort = signal<Sort>({ active: 'uploadDate', direction: 'desc' });

  uploading = signal(false);
  uploadProgress = signal(0);
  uploadingName = signal('');

  // Id of the file with a download or delete in progress
  busyId = signal<string | null>(null);

  // True while at least one file is still being processed
  hasInProgress = computed(() =>
    this.files().some((f) => f.status === 'PENDING' || f.status === 'PROCESSING'),
  );

  // Files after applying the search term and the chosen sort order
  rows = computed(() => {
    const term = this.search().trim().toLowerCase();
    const { active, direction } = this.sort();

    const filtered = this.files().filter((f) => f.fileName.toLowerCase().includes(term));
    if (!direction) {
      return filtered;
    }

    const dir = direction === 'asc' ? 1 : -1;
    const valueOf = (f: FileItem): string | number => {
      switch (active) {
        case 'fileName':
          return f.fileName.toLowerCase();
        case 'fileType':
          return f.fileType.toLowerCase();
        case 'status':
          return f.status;
        case 'fileSize':
          return f.fileSize;
        default:
          return f.uploadDate;
      }
    };

    return [...filtered].sort((a, b) => {
      const x = valueOf(a);
      const y = valueOf(b);
      return x < y ? -dir : x > y ? dir : 0;
    });
  });

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

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  onSort(sort: Sort): void {
    this.sort.set(sort);
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

  download(file: FileItem): void {
    this.busyId.set(file.uploadId);

    this.fileService.getDownloadUrl(file.uploadId).subscribe({
      next: (url) => {
        this.busyId.set(null);
        window.open(url, '_blank', 'noopener');
      },
      error: (err) => {
        this.busyId.set(null);
        this.snackBar.open(
          errorMessage(err, "We couldn't prepare the download. Please try again."),
          'OK',
          { duration: 6000 },
        );
      },
    });
  }

  confirmDelete(file: FileItem): void {
    const data: ConfirmDialogData = {
      title: 'Delete this file?',
      message: `"${file.fileName}" will be permanently deleted. This can't be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
    };

    this.dialog
      .open(ConfirmDialog, { width: '420px', data })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (confirmed) {
          this.delete(file);
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

  protected helpFor(status: FileStatus): string {
    return STATUS_HELP[status];
  }

  protected canDownload(file: FileItem): boolean {
    return file.status === 'COMPLETED';
  }

  protected canDelete(file: FileItem): boolean {
    return file.status !== 'PROCESSING' && file.status !== 'DELETED';
  }

  protected downloadHint(file: FileItem): string {
    return this.canDownload(file) ? 'Download' : 'Available once processing is complete';
  }

  protected deleteHint(file: FileItem): string {
    return this.canDelete(file) ? 'Delete' : "Can't delete while the file is being processed";
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
      error: (err) => {
        this.uploading.set(false);
        this.snackBar.open(
          errorMessage(err, 'Upload failed. Please try again.'),
          'OK',
          { duration: 6000 },
        );
      },
    });
  }

  private delete(file: FileItem): void {
    this.busyId.set(file.uploadId);

    this.fileService.delete(file.uploadId).subscribe({
      next: () => {
        this.busyId.set(null);
        this.files.update((list) => list.filter((f) => f.uploadId !== file.uploadId));
        this.snackBar.open(`"${file.fileName}" was deleted.`, 'OK', { duration: 4000 });
      },
      error: (err) => {
        this.busyId.set(null);
        this.snackBar.open(
          errorMessage(err, "We couldn't delete this file. Please try again."),
          'OK',
          { duration: 6000 },
        );
      },
    });
  }

  private loadFiles(): void {
    this.fileService.list().subscribe({
      next: (files) => {
        this.files.set(files);
        this.error.set(null);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          errorMessage(err, "We couldn't load your files. Check your connection and try again."),
        );
        this.loading.set(false);
      },
    });
  }
}