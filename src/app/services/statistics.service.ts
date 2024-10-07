import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export type TotalScoreResponse = {
  totalScore: number;
};

export type SolutionAttemptResponse = {
  solutionAttemptsPerSubtopic: Array<SolutionAttemptPerSubtopic>;
};

export type SolutionAttemptPerSubtopic = {
  subtopic: {
    id: number;
    name: string;
  };
  totalTasksInSubtopicCount: number;
  successfullyCompletedTasksCount: number;
  totalTries: number;
};

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  constructor(private apiService: ApiService) {}

  getTotalScore(): Observable<TotalScoreResponse> {
    return this.apiService.get('/statistics/total-score', true);
  }

  getSolutionAttempts(): Observable<SolutionAttemptResponse> {
    return this.apiService.get('/statistics/solution-attempts', true);
  }
}
