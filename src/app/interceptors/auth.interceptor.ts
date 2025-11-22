import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpStatusCode,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { NEVER, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const APPEND_AUTHORIZATION = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (req.context.get(APPEND_AUTHORIZATION)) {
    req = authService.getRequestWithAuthHeader(req);
  }

  return next(req).pipe(
    catchError((errRes: HttpErrorResponse) => {
      const isAuthTokenExpiredResponse =
        errRes.status === HttpStatusCode.Unauthorized;
      const isFailedRefreshResponse =
        errRes.status === HttpStatusCode.Forbidden;

      if (isAuthTokenExpiredResponse) {
        return authService.refreshTokens().pipe(
          switchMap(() => {
            const newRequest = authService.getRequestWithAuthHeader(req);
            return next(newRequest);
          })
        );
      } else if (isFailedRefreshResponse) {
        router.navigateByUrl('/logout?expired=true', { replaceUrl: true });
        return NEVER;
      } else {
        return throwError(() => errRes);
      }
    })
  );
};
