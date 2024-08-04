import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Video } from '../../../../types/models';

@Component({
  selector: 'app-video-card',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './video-card.component.html',
  styleUrl: './video-card.component.scss',
})
export class VideoCardComponent {
  @Input() video!: Video;
  @Output() videoSelected = new EventEmitter<Video>();

  onVideoSelected() {
    this.videoSelected.emit(this.video);
  }
}
