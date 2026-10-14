import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { UserRoles } from './auth/user-roles';
import { APP_CONFIG } from './config/app-config';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly oidc = inject(OidcSecurityService);

  protected readonly isAdmin = toSignal(inject(UserRoles).isAdmin(), { initialValue: false });
  protected readonly year = new Date().getFullYear();

  logout(): void {
    this.oidc.logoffLocal();
    const logoutUri = encodeURIComponent(window.location.origin + '/');
    window.location.href =
      `${APP_CONFIG.cognitoDomain}/logout?client_id=${APP_CONFIG.clientId}&logout_uri=${logoutUri}`;
  }
}