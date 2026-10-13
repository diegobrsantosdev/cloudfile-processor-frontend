import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  protected readonly stack = [
    'Java',
    'Spring Boot',
    'Spring Security',
    'Amazon S3',
    'Amazon SQS',
    'ECS Fargate',
    'DynamoDB',
    'Cognito',
    'CloudFormation',
    'GitHub Actions',
    'Angular',
    'Angular Material',
    'TypeScript',
  ];

  protected readonly backendRepo = 'https://github.com/diegobrsantosdev/cloudfile-processor';
  protected readonly frontendRepo =
    'https://github.com/diegobrsantosdev/cloudfile-processor-frontend';
}