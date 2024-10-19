import { Component, Input } from '@angular/core';
import { News } from '../../../../types/models';
import { FormatTimePipe } from '../../../pipes/format-time.pipe';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [FormatTimePipe],
  providers: [FormatTimePipe],
  templateUrl: './news-card.component.html',
  styleUrl: './news-card.component.scss',
})
export class NewsCardComponent {
  @Input({ required: true }) newsItem!: News;
}
