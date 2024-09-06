import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FullTask, HelpStep, Topic } from '../../types/models';
import { ApiService } from './api.service';

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
  isFinalBoss: boolean;
  solutionCode?: string;
  tests: NewTestDefinition[];
  helpSteps: HelpStep[];
};

export enum RegistrationErrorCode {
  EXEC_ERR_CODE_NO_TESTS = 1,
  EXEC_ERR_ARTEFACT_CONTENT_MISMATCH = 2,
  EXEC_ERR_TEST_FAILED = 3,
  EXEC_ERR_TIMEOUT = 4,
}

export type TaskExecutionResponse = {
  success: boolean;
  message: string;
  errorCode: RegistrationErrorCode;
  reason: {
    testInput: string | undefined;
    output: string | undefined;
    expectedOutput: string | undefined;
  };
};

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private apiService: ApiService) {}

  getTasksPerTopics(): Observable<TasksResponse> {
    return this.apiService.get<TasksResponse>(
      '/tasks'
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
    return this.apiService.post<TaskExecutionResponse>(`/tasks/${taskId}/run`, {
      solutionCode,
    }) as Observable<TaskExecutionResponse>;
  }
}
