import { Routes } from '@angular/router';
import { autoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
import { adminGuard } from './auth/admin.guard';
import { About } from './pages/about/about';
import { Admin } from './pages/admin/admin';
import { FileList } from './pages/file-list/file-list';
import { HistoryPage } from './pages/history/history';
import { Home } from './pages/home/home';
import { Support } from './pages/support/support';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    pathMatch: 'full',
    canActivate: [autoLoginPartialRoutesGuard],
    title: 'Home · CloudFile Processor',
  },
  {
    path: 'files',
    component: FileList,
    canActivate: [autoLoginPartialRoutesGuard],
    title: 'My files · CloudFile Processor',
  },
  {
    path: 'history',
    component: HistoryPage,
    canActivate: [autoLoginPartialRoutesGuard],
    title: 'History · CloudFile Processor',
  },
  {
    path: 'admin',
    component: Admin,
    canActivate: [autoLoginPartialRoutesGuard, adminGuard],
    title: 'Admin · CloudFile Processor',
  },
  {
    // Public pages: no login required
    path: 'support',
    component: Support,
    title: 'Support · CloudFile Processor',
  },
  {
    path: 'about',
    component: About,
    title: "How it's built · CloudFile Processor",
  },
  { path: '**', redirectTo: '' },
];