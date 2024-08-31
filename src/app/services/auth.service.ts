import { HttpRequest } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap, throwError } from 'rxjs';
import { ApiService } from './api.service';

export enum RegistrationErrorCode {
  INFO_INVALID = 1,
  USERNAME_OR_EMAIL_TAKEN = 2,
}

export type RegistrationFailureResponse = {
  success: boolean;
  message: string;
  errorCode: RegistrationErrorCode;
};

type User = {
  id: number;
  username: string;
  email: string;
  type: string;
};

type LoginResponse = {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: {
      value: string;
      expiresAt: string;
    };
  };
};

type RefreshResponse = {
  success: boolean;
  accessToken: string;
  refreshToken: {
    value: string;
    expiresAt: string;
  };
};

const specialTypes = ['creator', 'admin'];

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;

  constructor(private apiService: ApiService) {}

  register(username: string, email: string, password: string) {
    const registrationResponse =
      this.apiService.post<RegistrationFailureResponse>('/auth/register', {
        username,
        email,
        password,
      });

    return registrationResponse;
  }

  login(identifier: string, password: string): Observable<LoginResponse> {
    const loginResponse = this.apiService
      .post<LoginResponse>('/auth/login', {
        identifier,
        password,
      })
      .pipe(
        tap({
          next: (res: LoginResponse) => {
            this.setUser(res.user);
            this.setTokens(
              res.tokens.accessToken,
              res.tokens.refreshToken.value
            );
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
    return this.apiService.post('/auth/activate', {
      activationToken: activationToken,
    });
  }

  requestPasswordReset(email: string): Observable<{ username: string }> {
    return this.apiService.post('/auth/password/request-reset', {
      email: email,
    });
  }

  getUser(): User | null {
    const userFromLocalStorage = localStorage.getItem('user');
    if (!this.user && userFromLocalStorage !== null) {
      this.user = JSON.parse(userFromLocalStorage);
    }
    return this.user;
  }

  refreshTokens(): Observable<RefreshResponse> {
    if (!this.isLoggedIn) throwError(() => 'Not logged in!');
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
            this.setTokens(res.accessToken, res.refreshToken.value);
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

  isLoggedIn = signal(this.getAccessToken() !== null);

  isSpecialType = signal(this.checkIfSpecialType());

  private clearAllLoginData() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    this.refreshToken = null;
    localStorage.removeItem('refreshToken');
    this.isLoggedIn.set(false);
    this.isSpecialType.set(false);
  }

  private checkIfSpecialType(): boolean {
    const user = this.getUser();
    return user?.type !== undefined && specialTypes.includes(user?.type);
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    localStorage.setItem('accessToken', accessToken);
    this.refreshToken = refreshToken;
    localStorage.setItem('refreshToken', refreshToken);
  }

  private setUser(user: User): void {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  private getAccessToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  private getRefreshToken(): string | null {
    if (!this.refreshToken) {
      this.refreshToken = localStorage.getItem('refreshToken');
    }
    return this.refreshToken;
  }
}
