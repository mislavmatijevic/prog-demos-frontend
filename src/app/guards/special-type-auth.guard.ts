import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const specialTypeAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const isSpecialUser = inject(AuthService).isSpecialType();
  if (!isSpecialUser) {
    router.navigateByUrl('/');
  }
  return isSpecialUser;
};
