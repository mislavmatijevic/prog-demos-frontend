import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { News } from '../../../types/models';
import { NewsService } from '../../services/news.service';
import { NewsCardComponent } from './news-card/news-card.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, NewsCardComponent, RouterModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent implements OnInit {
  constructor(private newsService: NewsService) {}
  fetchedNews: Array<News> = [];

  ngOnInit(): void {
    this.newsService.getNews().subscribe({
      next: (res) => {
        this.fetchedNews = res.news.sort(
          (news1, news2) => news1.time.localeCompare(news2.time) * -1
        );
      },
    });
  }
}
