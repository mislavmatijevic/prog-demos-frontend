import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Topic, Video } from '../../types/models';
import { ApiService } from './api.service';

export type VideosResponse = {
  topics: Array<Topic>;
};

export type VideoResponse = {
  video: Video;
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

  getSingleVideo(videoId: number): Observable<VideoResponse> {
    return this.apiService.get<VideoResponse>(
      `/videos/${videoId}`
    ) as Observable<VideoResponse>;
  }
}
