import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../components/confirm-dialog/confirm-dialog';
import { FileItem } from '../../models/file-item';
import { AdminService } from '../../services/admin.service';
import { errorMessage } from '../../utils/api-error';
import { formatSize } from '../../utils/format-size';

@Component({
  selector: 'app-admin',
  imports: [DatePipe, MatButtonModule, MatIconModule, MatTableModule, MatTooltipModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly formatSize = formatSize;
  protected readonly columns = ['fileName', 'status', 'fileSize', 'uploadDate', 'actions'];

  users = signal<string[]>([]);
  usersLoading = signal(true);
  usersError = signal<string | null>(null);

  selectedUser = signal<string | null>(null);
  files = signal<FileItem[]>([]);
  filesLoading = signal(false);
  filesError = signal<string | null>(null);

  // Id of the file with an action in progress
  busyId = signal<string | null>(null);

  // Most recent first
  rows = computed(() =>
    [...this.files()].sort((a, b) => b.uploadDate.localeCompare(a.uploadDate)),
  );

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersLoading.set(true);
    this.usersError.set(null);

    this.adminService.listUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.usersLoading.set(false);
      },
      error: (err) => {
        this.usersError.set(errorMessage(err, "We couldn't load the users."));
        this.usersLoading.set(false);
      },
    });
  }

  selectUser(userId: string): void {
    this.selectedUser.set(userId);
    this.loadFiles();
  }

  loadFiles(): void {
    const userId = this.selectedUser();
    if (!userId) {
      return;
    }

    this.filesLoading.set(true);
    this.filesError.set(null);

    this.adminService.listUserFiles(userId).subscribe({
      next: (files) => {
        // Ignore the answer if another user was selected in the meantime
        if (this.selectedUser() === userId) {
          this.files.set(files);
          this.filesLoading.set(false);
        }
      },
      error: (err) => {
        if (this.selectedUser() === userId) {
          this.filesError.set(errorMessage(err, "We couldn't load this user's files."));
          this.filesLoading.set(false);
        }
      },
    });
  }

  confirmReprocess(file: FileItem): void {
    this.confirm(
      {
        title: 'Reprocess this file?',
        message: `"${file.fileName}" will be sent through processing again.`,
        confirmLabel: 'Reprocess',
      },
      () => this.reprocess(file),
    );
  }

  confirmDelete(file: FileItem): void {
    this.confirm(
      {
        title: 'Delete this file?',
        message: `"${file.fileName}" will be permanently deleted for this user. This can't be undone.`,
        confirmLabel: 'Delete',
        destructive: true,
      },
      () => this.delete(file),
    );
  }

  protected shortId(userId: string): string {
    return userId.length > 13 ? userId.slice(0, 8) + '…' : userId;
  }

  protected canReprocess(file: FileItem): boolean {
    return file.status === 'FAILED';
  }

  protected canDelete(file: FileItem): boolean {
    return file.status !== 'DELETED';
  }

  protected reprocessHint(file: FileItem): string {
    return this.canReprocess(file) ? 'Reprocess' : 'Only failed files can be reprocessed';
  }

  protected deleteHint(file: FileItem): string {
    return this.canDelete(file) ? 'Delete permanently' : 'This file is already deleted';
  }

  private confirm(data: ConfirmDialogData, onConfirm: () => void): void {
    this.dialog
      .open(ConfirmDialog, { width: '420px', data })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (confirmed) {
          onConfirm();
        }
      });
  }

  private reprocess(file: FileItem): void {
    this.busyId.set(file.uploadId);

    this.adminService.reprocess(file.uploadId).subscribe({
      next: () => {
        this.busyId.set(null);
        this.snackBar.open(`"${file.fileName}" was sent for reprocessing.`, 'OK', {
          duration: 4000,
        });
        this.loadFiles();
      },
      error: (err) => {
        this.busyId.set(null);
        this.snackBar.open(
          errorMessage(err, "We couldn't reprocess this file. Please try again."),
          'OK',
          { duration: 6000 },
        );
      },
    });
  }

  private delete(file: FileItem): void {
    this.busyId.set(file.uploadId);

    this.adminService.delete(file.uploadId).subscribe({
      next: () => {
        this.busyId.set(null);
        this.snackBar.open(`"${file.fileName}" was deleted.`, 'OK', { duration: 4000 });
        this.loadFiles();
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
}