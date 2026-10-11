import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FileItem } from '../../models/file-item';

@Component({
  selector: 'app-file-list',
  imports: [DatePipe],
  templateUrl: './file-list.html',
  styleUrl: './file-list.css',
})
export class FileList {
  files: FileItem[] = [
    {
      fileId: '1',
      fileName: 'relatorio-marco.pdf',
      status: 'COMPLETED',
      sizeInBytes: 10240,
      uploadDate: '2026-03-26T14:30:00Z',
      updatedAt: '2026-03-26T14:32:15Z',
    },
    {
      fileId: '2',
      fileName: 'foto-equipe.png',
      status: 'PROCESSING',
      sizeInBytes: 2048000,
      uploadDate: '2026-03-27T09:10:00Z',
      updatedAt: '2026-03-27T09:10:20Z',
    },
    {
      fileId: '3',
      fileName: 'contrato.docx',
      status: 'PENDING',
      sizeInBytes: 51200,
      uploadDate: '2026-03-27T10:00:00Z',
      updatedAt: '2026-03-27T10:00:00Z',
    },
    {
      fileId: '4',
      fileName: 'dados.csv',
      status: 'FAILED',
      sizeInBytes: 987654,
      uploadDate: '2026-03-27T11:45:00Z',
      updatedAt: '2026-03-27T11:46:30Z',
    },
  ];

  formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
      return Math.round(bytes / 1024) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}