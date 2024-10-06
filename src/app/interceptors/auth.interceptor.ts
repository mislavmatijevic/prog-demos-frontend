import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const APPEND_AUTHORIZATION = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  let messageService: MessageService;

  if (req.context.get(APPEND_AUTHORIZATION)) {
    req = authService.getRequestWithAuthHeader(req);
  }

  return next(req).pipe(
    catchError((errRes: HttpErrorResponse) => {
      if (errRes.status === 401) {
        if (messageService === undefined) {
          messageService = inject(MessageService);
        }
        messageService.add({
          key: 'general',
          severity: 'error',
          detail: 'Ne čini se da imaš prava pristupiti ovome!',
        });
        router.navigateByUrl('/login');
        return throwError(() => errRes);
      } else if (errRes.status === 403) {
        return authService.refreshTokens().pipe(
          switchMap(() => {
            const newRequest = authService.getRequestWithAuthHeader(req);
            return next(newRequest);
          }),
          catchError((err: HttpErrorResponse) => {
            if (err.status === 403) {
              router.navigateByUrl('/login');
            }
            return throwError(() => errRes);
          })
        );
      } else {
        return throwError(() => errRes);
      }
    })
  );
};
