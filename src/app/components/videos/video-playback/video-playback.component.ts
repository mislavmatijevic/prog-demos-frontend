import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Video } from '../../../../types/models';
import { VideoResponse, VideoService } from '../../../services/video.service';

@Component({
  selector: 'app-video-playback',
  standalone: true,
  imports: [],
  templateUrl: './video-playback.component.html',
  styleUrl: './video-playback.component.scss',
})
export class VideoPlaybackComponent {
  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private videoService: VideoService
  ) {}

  static get parameters() {
    return [DomSanitizer];
  }

  video!: Video;

  ngOnInit() {
    const videoId = parseInt(this.route.snapshot.paramMap.get('videoId')!);
    this.fetchVideo(videoId);
  }

  fetchVideo(videoId: number) {
    this.videoService.getSingleVideo(videoId).subscribe({
      next: (res: VideoResponse) => {
        this.video = res.video;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getYtEmbedUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${this.video.identifier}`
    );
  }
}
