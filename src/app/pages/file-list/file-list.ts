import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FileItem } from '../../models/file-item';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-file-list',
  imports: [DatePipe],
  templateUrl: './file-list.html',
  styleUrl: './file-list.css',
})
export class FileList implements OnInit {
  private readonly fileService = inject(FileService);

  files = signal<FileItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.fileService.list().subscribe({
      next: (files) => {
        this.files.set(files);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os arquivos.');
        this.loading.set(false);
      },
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
      return Math.round(bytes / 1024) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}