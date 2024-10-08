import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FullTask, HelpStep, TaskScore, Topic } from '../../types/models';
import { SyntaxError } from '../components/editor/editor.component';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export type TasksResponse = {
  topics: Array<Topic>;
};

export type TaskResponse = {
  task: FullTask;
};

export type NewTestDefinition = {
  input: string;
  expectedOutput: string;
  artefactSha256?: string;
};

export type NewTaskRequestBody = {
  idSubtopic: number;
  name: string;
  complexity: string;
  input: string;
  output: string;
  inputOutputExample: string;
  isBossBattle: boolean;
  solutionCode?: string;
  tests: NewTestDefinition[];
  helpSteps: HelpStep[];
};

export enum SolutionErrorCode {
  EXEC_ERR_BAD_SYNTAX = 1,
  EXEC_ERR_TEST_FAILED = 2,
  EXEC_ERR_TIMEOUT = 3,
  EXEC_ERR_KILLED = 4,
  EXEC_ERR_ARTEFACT_CONTENT_MISMATCH = 5,
}

export type SuccessfulTaskExecutionResponse = {
  success: boolean;
  message: string;
  score: TaskScore;
};

export interface ExecutionFailureReasonTests {
  testInput: string;
}

export type ExecutionFailureReasonOutputMismatch =
  ExecutionFailureReasonTests & {
    output: string;
    expectedOutput: string;
  };

export type FailedTaskExecutionResponse = {
  errorCode: SolutionErrorCode;
  reason: ExecutionFailureReasonTests &
    ExecutionFailureReasonOutputMismatch &
    Array<SyntaxError>;
};

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  getTasksPerTopics(): Observable<TasksResponse> {
    return this.apiService.get<TasksResponse>(
      '/tasks',
      this.authService.isLoggedIn()
    ) as Observable<TasksResponse>;
  }

  getSingleTask(taskId: number): Observable<TaskResponse> {
    return this.apiService.get<TaskResponse>(
      `/tasks/${taskId}`
    ) as Observable<TaskResponse>;
  }

  createTask(newTask: NewTaskRequestBody) {
    return this.apiService.post<TaskResponse>(
      `/tasks`,
      newTask
    ) as Observable<TaskResponse>;
  }

  executeTask(taskId: number, solutionCode: string) {
    return this.apiService.post<SuccessfulTaskExecutionResponse>(
      `/tasks/${taskId}/run`,
      {
        solutionCode,
      }
    ) as Observable<SuccessfulTaskExecutionResponse>;
  }
}
