import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
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
export class TaskScoreGraphComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] !== undefined) {
      this.refreshStats();
      this.visibleChange.emit(this.visible);
    }
  }

  handleVisibleChange(newState: boolean) {
    this.visible = newState;
    this.visibleChange.emit(this.visible);
  }

  private refreshStats() {
    this.complexityData = {
      labels: ['Kompleksnost rješenja'],
      datasets: [
        {
          label: 'Tvoje rješenje',
          data: [this.userScore.complexity],
        },
        {
          label: 'Prosječna kompleksnost',
          data: [this.averageScore.complexity],
        },
        {
          label: 'Najbolja kompleksnost',
          data: [this.bestScore.complexity],
        },
      ],
    };
    this.tokensData = {
      labels: ['Količina koda u rješenjima'],
      datasets: [
        {
          label: 'Tvoja količina koda',
          data: [this.userScore.tokens],
        },
        {
          label: 'Prosječna količina koda',
          data: [this.averageScore.tokens],
        },
        {
          label: 'Najbolja kompleksnost',
          data: [this.bestScore.tokens],
        },
      ],
    };
    this.scoresData = {
      labels: ['Ostvaren XP'],
      datasets: [
        {
          label: 'Tvoji ostvareni bodovi',
          data: [this.userScore.totalScore],
        },
        {
          label: 'Prosjek za ovaj zadatak',
          data: [this.averageScore.totalScore],
        },
        {
          label: 'Bodovi najboljeg rješenja',
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
