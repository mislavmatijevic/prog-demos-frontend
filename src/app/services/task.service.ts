import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FullTask, Topic } from '../../types/models';
import { ApiService } from './api.service';

export type TasksResponse = {
  topics: Array<Topic>;
};

export type TaskResponse = {
  Task: FullTask;
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
}
