import { HttpRequest } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap, throwError } from 'rxjs';
import { ApiService } from './api.service';

export enum AuthErrorCode {
  INFO_INVALID = 1,
  USERNAME_OR_EMAIL_TAKEN = 2,
  EXEC_ERR_RECAPTCHA_REQUIRES_CHALLENGE = 3,
}

export type AuthFailureResponse = {
  success: boolean;
  message: string;
  errorCode: AuthErrorCode;
};

type User = {
  id: number;
  username: string;
  email: string;
  type: string;
};

type LoginResponse = {
  user: User;
  tokens: TokensBody;
};

type TokensBody = {
  accessToken: string;
  refreshToken: RefreshTokenBody;
};

type RefreshTokenBody = {
  value: string;
  expiresAt: string;
};

type RefreshResponse = {
  success: boolean;
  tokens: TokensBody;
};

const specialTypes = ['creator', 'admin'];
const accessTokenStorageKey = 'accessToken';
const refreshTokenValueStorageKey = 'refreshTokenValue';
const refreshTokenExpiryStorageKey = 'refreshTokenExpiry';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;

  constructor(private apiService: ApiService) {}

  register(
    username: string,
    email: string,
    password: string,
    recaptchaToken: string
  ) {
    const registrationResponse = this.apiService.post<AuthFailureResponse>(
      '/auth/register',
      {
        username,
        email,
        password,
        recaptchaToken,
      },
      false
    );

    return registrationResponse;
  }

  login(
    identifier: string,
    password: string,
    recaptchaToken: string
  ): Observable<LoginResponse> {
    const loginResponse = this.apiService
      .post<LoginResponse>(
        '/auth/login',
        {
          identifier,
          password,
          recaptchaToken,
        },
        false
      )
      .pipe(
        tap({
          next: (res: LoginResponse) => {
            this.setUser(res.user);
            this.setTokens(res.tokens);
            this.isLoggedIn.set(true);
            this.isSpecialType.set(this.checkIfSpecialType());
          },
        })
      );

    return loginResponse;
  }

  logout(): void {
    this.apiService
      .post('/auth/logout', {
        refreshToken: this.getRefreshToken(),
      })
      .subscribe();
    this.clearAllLoginData();
  }

  activate(activationToken: string): Observable<{ username: string }> {
    return this.apiService.post(
      '/auth/activate',
      {
        activationToken: activationToken,
      },
      false
    );
  }

  requestPasswordReset(
    email: string,
    recaptchaToken: string
  ): Observable<{ username: string }> {
    return this.apiService.post(
      '/auth/password/request-reset',
      {
        email,
        recaptchaToken,
      },
      false
    );
  }

  resetPassword(
    newPassword: string,
    resetToken: string,
    recaptchaToken: string
  ): Observable<void> {
    return this.apiService.post(
      '/auth/password/reset',
      {
        newPassword,
        resetToken,
        recaptchaToken,
      },
      false
    );
  }

  getUser(): User | null {
    const userFromLocalStorage = localStorage.getItem('user');
    if (!this.user && userFromLocalStorage !== null) {
      this.user = JSON.parse(userFromLocalStorage);
    }
    return this.user;
  }

  refreshTokens(): Observable<RefreshResponse> {
    if (!this.isLoggedIn()) throwError(() => 'Not logged in!');
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    return this.apiService
      .post<RefreshResponse>('/auth/refresh', {
        accessToken,
        refreshToken,
      })
      .pipe(
        tap({
          next: (res: RefreshResponse) => {
            this.setTokens(res.tokens);
            this.isLoggedIn.set(true);
            this.isSpecialType.set(this.checkIfSpecialType());
          },
          error: () => {
            this.clearAllLoginData();
          },
        })
      );
  }

  getRequestWithAuthHeader(req: HttpRequest<unknown>): HttpRequest<unknown> {
    const authorizedRequest = req.clone({
      headers: req.headers
        .delete('Authorization')
        .append('Authorization', `Bearer ${this.getAccessToken()}`),
    });
    return authorizedRequest;
  }

  ensureRefreshTokenStillValid(): boolean {
    const refreshTokenExpiry = localStorage.getItem(
      refreshTokenExpiryStorageKey
    );
    if (refreshTokenExpiry === null) return false;

    const currentTime = new Date();
    const expiryTime = new Date(refreshTokenExpiry!);

    const isExpired = currentTime > expiryTime;
    if (isExpired) {
      this.clearAllLoginData();
    }

    return isExpired;
  }

  isLoggedIn = signal(this.getAccessToken() !== null);

  isSpecialType = signal(this.checkIfSpecialType());

  private clearAllLoginData() {
    this.accessToken = null;
    localStorage.removeItem(accessTokenStorageKey);
    this.refreshToken = null;
    localStorage.removeItem(refreshTokenValueStorageKey);
    localStorage.removeItem(refreshTokenExpiryStorageKey);
    this.isLoggedIn.set(false);
    this.isSpecialType.set(false);
  }

  private checkIfSpecialType(): boolean {
    const user = this.getUser();
    return user?.type !== undefined && specialTypes.includes(user?.type);
  }

  private setTokens(tokens: TokensBody): void {
    const accessTokenValue = tokens.accessToken;
    const refreshTokenValue = tokens.refreshToken.value;
    const refreshTokenExpiryTime = tokens.refreshToken.expiresAt;

    this.accessToken = accessTokenValue;
    localStorage.setItem(accessTokenStorageKey, accessTokenValue);
    this.refreshToken = refreshTokenValue;
    localStorage.setItem(refreshTokenValueStorageKey, refreshTokenValue);
    localStorage.setItem(refreshTokenExpiryStorageKey, refreshTokenExpiryTime);
  }

  private setUser(user: User): void {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  private getAccessToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem(accessTokenStorageKey);
    }
    return this.accessToken;
  }

  private getRefreshToken(): string | null {
    if (!this.refreshToken) {
      this.refreshToken = localStorage.getItem(refreshTokenValueStorageKey);
    }
    return this.refreshToken;
  }
}
