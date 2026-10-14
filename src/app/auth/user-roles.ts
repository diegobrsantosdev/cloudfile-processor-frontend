import { inject, Injectable } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { catchError, map, Observable, of } from 'rxjs';

const ADMIN_GROUP = 'ADMIN';

@Injectable({ providedIn: 'root' })
export class UserRoles {
  private readonly oidc = inject(OidcSecurityService);

  /** True when the signed-in user belongs to the Cognito ADMIN group. */
  isAdmin(): Observable<boolean> {
    return this.oidc.getPayloadFromIdToken().pipe(
      map((payload) => {
        const groups: unknown = payload?.['cognito:groups'];
        return Array.isArray(groups) && groups.includes(ADMIN_GROUP);
      }),
      catchError(() => of(false)),
    );
  }
}