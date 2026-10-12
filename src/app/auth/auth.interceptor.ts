import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { switchMap, take } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Só envia o token para a nossa API (nunca para o S3, por exemplo)
  if (!req.url.startsWith(APP_CONFIG.apiBaseUrl)) {
    return next(req);
  }

  const oidc = inject(OidcSecurityService);
  return oidc.getAccessToken().pipe(
    take(1),
    switchMap((token) =>
      next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req),
    ),
  );
};