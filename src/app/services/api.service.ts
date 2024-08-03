import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { Observable } from 'rxjs';

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

  get<T>(url: string): Observable<T> {
    const uri = `${this.rootUrl}${url}`;
    return this.httpClient.get<T>(uri) as Observable<T>;
  }
}
