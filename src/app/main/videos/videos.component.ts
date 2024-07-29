import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Topic, Video } from '../../../types/models';
import { VideoCardComponent } from '../../components/videos/video-card/video-card.component';
import { VideoService } from '../../services/video.service';

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

  videos: Video[] = [];
  topics: Topic[] = [];

  ngOnInit() {
    this.fetchVideos();
  }

  fetchVideos() {
    this.videoService.getPublicVideos().subscribe({
      next: (videos: Video[]) => {
        this.videos = videos;

        this.videos = videos;
        this.loadUniqueTopicsForLoadedVideos();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  loadUniqueTopicsForLoadedVideos() {
    this.videos.forEach(
      (video) =>
        !this.topics.some((topic) => topic.name == video.topic.name) &&
        this.topics.push(video.topic)
    );
  }
}
