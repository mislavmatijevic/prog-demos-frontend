import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

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
  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  getSolutionAttempts(): Observable<SolutionAttemptResponse> {
    return this.apiService.get('/statistics/solution-attempts', true);
  }
}
