import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { APP_CONFIG } from './config/app-config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly oidc = inject(OidcSecurityService);

  logout(): void {
    this.oidc.logoffLocal();
    const logoutUri = encodeURIComponent(window.location.origin + '/');
    window.location.href =
      `${APP_CONFIG.cognitoDomain}/logout?client_id=${APP_CONFIG.clientId}&logout_uri=${logoutUri}`;
  }
}