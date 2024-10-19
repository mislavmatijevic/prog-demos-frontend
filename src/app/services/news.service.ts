import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { News } from '../../types/models';
import { ApiService } from './api.service';

export type NewsResponse = {
  success: boolean;
  news: Array<News>;
};

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  constructor(private apiService: ApiService) {}

  getNews(): Observable<NewsResponse> {
    return this.apiService.get('/news', false);
  }
}
