import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { FileItem, FileStatus } from '../../models/file-item';
import { FileService } from '../../services/file.service';
import { errorMessage } from '../../utils/api-error';

const STATUS_HELP: Record<FileStatus, string> = {
  PENDING: 'Received and waiting in line to be processed.',
  PROCESSING: 'Being processed right now.',
  COMPLETED: 'Done. Your file is stored and ready.',
  FAILED: 'Something went wrong while processing.',
  DELETED: 'This file was deleted.',
};

@Component({
  selector: 'app-history',
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule, MatSortModule, MatTableModule],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class HistoryPage implements OnInit {
  private readonly fileService = inject(FileService);

  protected readonly columns = ['fileName', 'fileType', 'status', 'fileSize', 'uploadDate'];

  files = signal<FileItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  search = signal('');
  sort = signal<Sort>({ active: 'uploadDate', direction: 'desc' });

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
    this.load();
  }

  retry(): void {
    this.loading.set(true);
    this.load();
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  onSort(sort: Sort): void {
    this.sort.set(sort);
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

  private load(): void {
    this.fileService.history().subscribe({
      next: (files) => {
        this.files.set(files);
        this.error.set(null);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          errorMessage(err, "We couldn't load your history. Check your connection and try again."),
        );
        this.loading.set(false);
      },
    });
  }
}