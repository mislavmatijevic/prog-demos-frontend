import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BasicTask, Topic } from '../../../types/models';
import { TasksInSubtopicComponent } from '../../components/tasks/tasks-in-subtopic/tasks-in-subtopic.component';
import { TaskService, TasksResponse } from '../../services/task.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, TasksInSubtopicComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent implements OnInit {
  constructor(private taskService: TaskService, private router: Router) {}

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

  onTaskSelected(task: BasicTask) {
    this.router.navigateByUrl(`/prog/${task.id}`);
  }
}
