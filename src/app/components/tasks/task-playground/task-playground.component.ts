import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FullTask } from '../../../../types/models';
import { TaskResponse, TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-task-playground',
  standalone: true,
  imports: [],
  templateUrl: './task-playground.component.html',
  styleUrl: './task-playground.component.scss',
})
export class TaskPlaygroundComponent {
  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService
  ) {}

  task!: FullTask;

  ngOnInit() {
    const taskId = parseInt(this.route.snapshot.paramMap.get('taskId')!);
    this.fetchVideo(taskId);
  }

  fetchVideo(videoId: number) {
    this.taskService.getSingleTask(videoId).subscribe({
      next: (res: TaskResponse) => {
        this.task = res.task;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
