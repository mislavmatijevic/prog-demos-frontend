import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(private apiService: ApiService) {}

  login(identifier: string, password: string): Observable<LoginResponse> {
    const loginResponse = this.apiService.post<LoginResponse>('/auth/login', {
      identifier,
      password,
    });

    loginResponse.subscribe({
      next: (res: LoginResponse) => {
        this._setTokens(res.accessToken, res.refreshToken);
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

  _setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    if (!this.refreshToken) {
      this.refreshToken = localStorage.getItem('refreshToken');
    }
    return this.refreshToken;
  }

  isLoggedIn(): boolean {
    return this.getAccessToken() !== null;
  }
}
