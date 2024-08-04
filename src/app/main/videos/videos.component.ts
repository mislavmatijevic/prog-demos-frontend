import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Topic } from '../../../types/models';
import { VideoCardComponent } from '../../components/videos/video-card/video-card.component';
import { VideoService, VideosResponse } from '../../services/video.service';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, VideoCardComponent],
  providers: [VideoService],
  templateUrl: './videos.component.html',
  styleUrl: './videos.component.scss',
})
export class VideosComponent {
  constructor(private videoService: VideoService) {}

  topics: Topic[] = [];

  ngOnInit() {
    this.fetchVideos();
  }

  fetchVideos() {
    this.videoService.getPublicVideosPerTopics().subscribe({
      next: (res: VideosResponse) => {
        this.topics = res.topics;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
