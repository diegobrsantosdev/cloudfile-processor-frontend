import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { UserRoles } from './user-roles';

/** Only lets admins in; everyone else goes back to the home page. */
export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(UserRoles)
    .isAdmin()
    .pipe(map((isAdmin) => isAdmin || router.createUrlTree(['/'])));
};