import { Component, Input, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';
import { TaskScore } from '../../../../types/models';

@Component({
  selector: 'app-task-score-graph',
  standalone: true,
  imports: [ChartModule, DialogModule],
  templateUrl: './task-score-graph.component.html',
  styleUrl: './task-score-graph.component.scss',
})
export class TaskScoreGraphComponent implements OnInit {
  @Input({ required: true }) userScore!: TaskScore;
  @Input({ required: true }) averageScore!: TaskScore;
  @Input({ required: true }) bestScore!: TaskScore;

  complexityData: any;
  tokensData: any;
  scoresData: any;
  options: any;

  ngOnInit(): void {
    this.refreshStats();
  }

  private refreshStats() {
    this.complexityData = {
      labels: ['Kompleksnost ovog zadatka'],
      datasets: [
        {
          label: 'Kompleksnost tvog koda',
          data: [this.userScore.complexity],
        },
        {
          label: 'Prosjek ostalih korisnika',
          data: [this.averageScore.complexity],
        },
        {
          label: 'Najbolje predano rješenje',
          data: [this.bestScore.complexity],
        },
      ],
    };
    this.tokensData = {
      labels: ['Količina koda rješenja zadatka'],
      datasets: [
        {
          label: 'Tvoja količina koda',
          data: [this.userScore.tokens],
        },
        {
          label: 'Prosjek ostalih korisnika',
          data: [this.averageScore.tokens],
        },
        {
          label: 'Najbolje predano rješenje',
          data: [this.bestScore.tokens],
        },
      ],
    };
    this.scoresData = {
      labels: ['Ostvaren XP na ovome zadatku'],
      datasets: [
        {
          label: 'Tvoji ostvareni bodovi',
          data: [this.userScore.totalScore],
        },
        {
          label: 'Prosjek ostalih korisnika',
          data: [this.averageScore.totalScore],
        },
        {
          label: 'Najbolje predano rješenje',
          data: [this.bestScore.totalScore],
        },
      ],
    };
    this.options = {
      labels: {
        color: 'red',
      },
      plugins: {
        legend: {
          padding: 50,
          align: 'start',
          labels: {
            color: 'lightblue',
          },
        },
      },
    };
  }
}
