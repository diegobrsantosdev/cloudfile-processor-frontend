import { Routes } from '@angular/router';
import { autoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
import { FileList } from './pages/file-list/file-list';

export const routes: Routes = [
  { path: '', redirectTo: 'files', pathMatch: 'full' },
  { path: 'files', component: FileList, canActivate: [autoLoginPartialRoutesGuard] },
];