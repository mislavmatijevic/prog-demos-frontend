import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Topic } from '../../../types/models';
import { TasksInSubtopicComponent } from '../../components/tasks/tasks-in-subtopic/tasks-in-subtopic.component';
import { TaskService, TasksResponse } from '../../services/task.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, TasksInSubtopicComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent {
  constructor(private taskService: TaskService) {}

  topics: Topic[] = [];

  ngOnInit() {
    this.fetchVideos();
  }

  fetchVideos() {
    this.taskService.getTasksPerTopics().subscribe({
      next: (res: TasksResponse) => {
        this.topics = res.topics;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
