import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Video } from '../../types/models';
import { ApiService } from './api.service';

export type Videos = {
  Videos: Array<Video>;
};

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  constructor(private apiService: ApiService) {}

  getPublicVideos(): Observable<Array<Video>> {
    return this.apiService.get<Array<Video>>('/videos/public') as Observable<
      Array<Video>
    >;
  }
}
