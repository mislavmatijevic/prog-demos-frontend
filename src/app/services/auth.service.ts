import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
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

export type LoginResponse = {
  user: {
    id: number;
    username: string;
    email: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: {
      value: string;
      expiresAt: string;
    };
  };
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private username: string | null = null;

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
    const loginResponse = this.apiService.post<LoginResponse>('/auth/login', {
      identifier,
      password,
    });

    loginResponse.subscribe({
      next: (res: LoginResponse) => {
        this.setTokens(res.tokens.accessToken, res.tokens.refreshToken.value);
        this.setUsername(res.user.username);
      },
    });

    return loginResponse;
  }

  logout(): void {
    this.apiService.post('/auth/logout', {
      refreshToken: this.refreshToken,
    });
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getUsername(): string | null {
    if (!this.username) {
      this.username = localStorage.getItem('username');
    }
    return this.username;
  }

  isLoggedIn = signal(this.getAccessToken() !== null);

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private setUsername(username: string): void {
    this.username = username;
    localStorage.setItem('username', username);
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
