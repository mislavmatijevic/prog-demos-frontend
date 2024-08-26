import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Topic, Video } from '../../../types/models';
import { VideoCardComponent } from '../../components/videos/video-card/video-card.component';
import { VideoService, VideosResponse } from '../../services/video.service';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, VideoCardComponent],
  templateUrl: './videos.component.html',
  styleUrl: './videos.component.scss',
})
export class VideosComponent implements OnInit {
  constructor(private videoService: VideoService, private _router: Router) {}

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

  onVideoSelected(video: Video) {
    this._router.navigateByUrl(`/demos/${video.id}`);
  }
}
