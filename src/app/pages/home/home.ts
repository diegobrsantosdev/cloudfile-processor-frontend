import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FileItem } from '../../models/file-item';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-home',
  imports: [DatePipe, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly fileService = inject(FileService);

  protected readonly steps = [
    {
      icon: 'upload_file',
      title: 'Upload',
      text: 'Choose a file and confirm. Large files are fine, up to 5 GB each, and you can follow the progress while it uploads.',
    },
    {
      icon: 'autorenew',
      title: 'We take it from here',
      text: 'Once the upload reaches 100%, your file is processed automatically in the background. You can leave the page and come back later.',
    },
    {
      icon: 'task_alt',
      title: 'Ready when you are',
      text: 'Every file shows its status in My files. Completed means it is stored and ready.',
    },
  ];

  protected readonly highlights = [
    { icon: 'lock', title: 'Private', text: 'You only see the files you uploaded.' },
    {
      icon: 'cloud_upload',
      title: 'Built for big files',
      text: 'Upload files up to 5 GB, with live progress.',
    },
    {
      icon: 'update',
      title: 'Always up to date',
      text: 'Statuses refresh on their own. No need to reload the page.',
    },
  ];

  files = signal<FileItem[]>([]);
  loading = signal(true);
  error = signal(false);

  // The 5 most recent uploads
  recent = computed(() =>
    [...this.files()].sort((a, b) => b.uploadDate.localeCompare(a.uploadDate)).slice(0, 5),
  );

  storageUsed = computed(() =>
    this.formatSize(this.files().reduce((sum, f) => sum + f.fileSize, 0)),
  );

  inProgress = computed(
    () => this.files().filter((f) => f.status === 'PENDING' || f.status === 'PROCESSING').length,
  );

  lastUpload = computed(() => this.recent()[0]?.uploadDate ?? null);

  ngOnInit(): void {
    this.fileService.list().subscribe({
      next: (files) => {
        this.files.set(files);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
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
}