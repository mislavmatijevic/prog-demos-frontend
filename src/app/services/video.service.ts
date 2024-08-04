import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Topic } from '../../types/models';
import { ApiService } from './api.service';

export type VideosResponse = {
  topics: Array<Topic>;
};

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  constructor(private apiService: ApiService) {}

  getPublicVideosPerTopics(): Observable<VideosResponse> {
    return this.apiService.get<VideosResponse>(
      '/videos/public'
    ) as Observable<VideosResponse>;
  }
}
