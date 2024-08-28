import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Topic } from '../../types/models';
import { ApiService } from './api.service';

export type TopicsResponse = {
  topics: Array<Topic>;
};

@Injectable({
  providedIn: 'root',
})
export class TopicsService {
  constructor(private apiService: ApiService) {}

  getTasksPerTopics(): Observable<TopicsResponse> {
    return this.apiService.get<TopicsResponse>(
      '/topics'
    ) as Observable<TopicsResponse>;
  }
}
