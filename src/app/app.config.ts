import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LogLevel, OidcSecurityService, provideAuth } from 'angular-auth-oidc-client';

import { routes } from './app.routes';
import { APP_CONFIG } from './config/app-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideAuth({
      config: {
        authority: APP_CONFIG.cognitoAuthority,
        redirectUrl: window.location.origin + '/',
        postLogoutRedirectUri: window.location.origin + '/',
        postLoginRoute: '/files',
        clientId: APP_CONFIG.clientId,
        scope: 'openid email profile',
        responseType: 'code',
        silentRenew: false,
        useRefreshToken: true,
        logLevel: LogLevel.Debug,
      },
    }),
    provideAppInitializer(() => {
      const oidc = inject(OidcSecurityService);
      return firstValueFrom(oidc.checkAuth());
    }),
  ],
};