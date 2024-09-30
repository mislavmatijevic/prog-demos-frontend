import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../services/auth.service';
import {
  SolutionAttemptPerSubtopic,
  SolutionAttemptResponse,
  StatisticsService,
} from '../../services/statistics.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressSpinnerModule, ChartModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private router: Router,
    private statisticsService: StatisticsService,
    private messageService: MessageService
  ) {}
  solutionAttempts: SolutionAttemptResponse | null = null;

  radarData!: object;
  radarOptions!: object;
  private dataPerAttempts!: Map<SolutionAttemptPerSubtopic, object>;
  private optionsPerAttempts!: Map<SolutionAttemptPerSubtopic, object>;

  ngOnInit(): void {
    this.statisticsService.getSolutionAttempts().subscribe({
      next: (response) => {
        this.solutionAttempts = response;
        this.radarData = this.getRadarData();
        this.radarOptions = this.getRadarOptions();
        this.dataPerAttempts = new Map();
        this.optionsPerAttempts = new Map();
        this.createDataForSolutionAttempts();
        this.createOptionsForSolutionAttempts();
      },
      error: () => {
        this.solutionAttempts = null;
        this.messageService.add({
          severity: 'error',
          detail: 'Nije uspio dohvat statistike o rješavanju zadataka.',
        });
      },
    });
  }

  signOut() {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }

  getRadarOptions(): any {
    return {
      plugins: {
        legend: {
          labels: {
            color: 'orange',
          },
        },
      },
      scales: {
        r: {
          grid: {
            color: 'orange',
          },
          pointLabels: {
            color: 'cyan',
          },
        },
      },
    };
  }

  getRadarData(): any {
    const labels = this.solutionAttempts?.solutionAttemptsPerSubtopic.map(
      (attempt) => attempt.subtopic.name
    );
    const completedTasks =
      this.solutionAttempts?.solutionAttemptsPerSubtopic.map(
        (attempt) => attempt.successfullyCompletedTasksCount
      );
    const totalTasks = this.solutionAttempts?.solutionAttemptsPerSubtopic.map(
      (attempt) => attempt.totalTasksInSubtopicCount
    );
    return {
      labels,
      datasets: [
        {
          label: 'Dovršeno zadataka',
          data: completedTasks,
        },
        {
          label: 'Ukupno zadataka',
          data: totalTasks,
        },
      ],
    };
  }

  getDataForCurrentAttempt(
    attemptPerSubtopic: SolutionAttemptPerSubtopic
  ): object {
    return this.dataPerAttempts.get(attemptPerSubtopic)!;
  }

  getOptionsForCurrentAttempt(
    attemptPerSubtopic: SolutionAttemptPerSubtopic
  ): object {
    return this.optionsPerAttempts.get(attemptPerSubtopic)!;
  }

  private createDataForSolutionAttempts() {
    this.solutionAttempts?.solutionAttemptsPerSubtopic.forEach(
      (attemptPerSubtopic) => {
        const completedCount =
          attemptPerSubtopic.successfullyCompletedTasksCount;
        const totalCount = attemptPerSubtopic.totalTasksInSubtopicCount;
        this.dataPerAttempts.set(attemptPerSubtopic, {
          labels: ['Riješeno zadataka', 'Preostalo zadataka'],
          datasets: [
            {
              data: [completedCount, totalCount - completedCount],
            },
          ],
        });
      }
    );
  }

  private createOptionsForSolutionAttempts() {
    this.solutionAttempts?.solutionAttemptsPerSubtopic.forEach(
      (attemptPerSubtopic) => {
        this.optionsPerAttempts.set(attemptPerSubtopic, {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: attemptPerSubtopic.subtopic.name,
              color: 'orange',
            },
          },
        });
      }
    );
  }
}
