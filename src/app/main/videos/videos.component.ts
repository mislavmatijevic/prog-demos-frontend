import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Video } from '../../../types/models';
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

  ngOnInit() {
    this.fetchVideos();
  }

  fetchVideos() {
    this.videoService.getPublicVideos().subscribe({
      next: (videos: any) => {
        console.log(videos);

        this.videos = videos;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
