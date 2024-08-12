import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authOk = inject(AuthService).isLoggedIn();
  if (!authOk) {
    router.navigateByUrl('/login');
  }
  return authOk;
};
