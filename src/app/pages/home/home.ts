import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
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
}