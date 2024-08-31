import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FullTask, Topic } from '../../types/models';
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
  starterCode: string;
  step1Code?: string;
  step2Code?: string;
  step3Code?: string;
  helper1Text?: string;
  helper2Text?: string;
  helper3Text?: string;
  solutionCode?: string;
  tests: NewTestDefinition[];
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
      newTask,
      true
    ) as Observable<TaskResponse>;
  }
}
