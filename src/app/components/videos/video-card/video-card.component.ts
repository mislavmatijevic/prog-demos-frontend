import { Component, Input } from '@angular/core';
import { Video } from '../../../../types/models';

@Component({
  selector: 'app-video-card',
  standalone: true,
  imports: [],
  templateUrl: './video-card.component.html',
  styleUrl: './video-card.component.scss',
})
export class VideoCardComponent {
  @Input() video!: Video;
}
