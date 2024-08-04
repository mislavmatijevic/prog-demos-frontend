import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Video } from '../../../../types/models';

@Component({
  selector: 'app-video-playback',
  standalone: true,
  imports: [],
  templateUrl: './video-playback.component.html',
  styleUrl: './video-playback.component.scss',
})
export class VideoPlaybackComponent {
  constructor(private sanitizer: DomSanitizer) {}

  static get parameters() {
    return [DomSanitizer];
  }

  @Input() video!: Video;
  getYtEmbedUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${this.video.identifier}`
    );
  }
}
