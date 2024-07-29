import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Video } from '../../../../types/models';

@Component({
  selector: 'app-video-card',
  standalone: true,
  imports: [],
  templateUrl: './video-card.component.html',
  styleUrl: './video-card.component.scss',
})
export class VideoCardComponent {
  constructor(private sanitizer: DomSanitizer) {}

  static get parameters() {
    return [DomSanitizer];
  }

  getYtEmbedUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${this.video.identifier}`
    );
  }
  @Input() video!: Video;
}
