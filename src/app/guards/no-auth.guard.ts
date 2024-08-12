import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const hasAuth = inject(AuthService).isLoggedIn();
  if (hasAuth) {
    router.navigateByUrl('/account');
  }
  return !hasAuth;
};
