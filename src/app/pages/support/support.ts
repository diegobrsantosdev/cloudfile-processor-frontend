import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-support',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './support.html',
  styleUrl: './support.css',
})
export class Support {
  private readonly snackBar = inject(MatSnackBar);

  protected readonly email = 'diegobrsantosdev@gmail.com';

  // Opens the user's email app with the subject and a short template already filled in
  protected readonly mailto =
    `mailto:${this.email}` +
    `?subject=${encodeURIComponent('CloudFile Processor support')}` +
    `&body=${encodeURIComponent(
      'Hi,\n\nI need help with...\n\nFile name (if any):\nWhat I was doing:\n',
    )}`;

  protected readonly faqs = [
    {
      question: 'What is the maximum file size?',
      answer:
        'Each file can be up to 5 GB. Larger files are not supported yet. Large files are welcome, just keep the tab open until the upload reaches 100%.',
    },
    {
      question: 'What do the statuses mean?',
      answer:
        'Pending: received and waiting in line. Processing: being processed right now. Completed: stored and ready to download. Failed: something went wrong while processing. Deleted: removed, but still listed in History.',
    },
    {
      question: 'My file is stuck on Pending. What should I do?',
      answer:
        "First, check that the upload reached 100% before you closed the tab. If it didn't, upload the file again. If it did and the file stays Pending for a long time, contact us and include the file name.",
    },
    {
      question: 'How do I download or delete a file?',
      answer:
        'Go to My files and use the icons in the Actions column. Download is available once a file is Completed. Delete always asks for confirmation, and files that are being processed can only be deleted after they finish.',
    },
    {
      question: 'What happens when I delete a file?',
      answer:
        'The file is removed and can no longer be downloaded. It stays listed in History, marked as Deleted.',
    },
    {
      question: 'Who can see my files?',
      answer: 'Only you. Each account sees only its own files.',
    },
  ];

  protected async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.email);
      this.snackBar.open('Email address copied.', 'OK', { duration: 3000 });
    } catch {
      this.snackBar.open(`Couldn't copy it. Our address is ${this.email}`, 'OK', {
        duration: 6000,
      });
    }
  }
}