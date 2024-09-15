import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { Observable } from 'rxjs';
import { APPEND_AUTHORIZATION } from '../interceptors/auth.interceptor';

type HttpClientGetOptions = Parameters<HttpClient['get']>[1];

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private rootUrl: string;

  constructor(private httpClient: HttpClient) {
    if (isDevMode()) {
      this.rootUrl = 'http://localhost:8080';
    } else {
      // TODO: Set to actual domain after domain is bought.
      this.rootUrl = 'https://prog_demos.com';
    }
  }

  get<T>(url: string, requiresAuth: boolean = false): Observable<T> {
    const uri = `${this.rootUrl}${url}`;
    let options = {
      context: new HttpContext().set(APPEND_AUTHORIZATION, requiresAuth),
    };
    return this.httpClient.get<T>(uri, options) as Observable<T>;
  }

  post<T>(url: string, body: any, requiresAuth: boolean = true): Observable<T> {
    const uri = `${this.rootUrl}${url}`;
    let options = {
      context: new HttpContext().set(APPEND_AUTHORIZATION, requiresAuth),
    };
    return this.httpClient.post<T>(uri, body, options);
  }
}
