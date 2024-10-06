import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BasicTask, Topic } from '../../../types/models';
import { TaskCardComponent } from '../../components/tasks/task-card/task-card.component';
import { TaskService, TasksResponse } from '../../services/task.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent implements OnInit {
  constructor(
    private taskService: TaskService,
    private router: Router,
    private messageService: MessageService
  ) {}

  topics: Topic[] = [];

  ngOnInit() {
    this.fetchTasks();
  }

  fetchTasks() {
    this.taskService.getTasksPerTopics().subscribe({
      next: (res: TasksResponse) => {
        this.topics = res.topics;
      },
      error: (error) => {
        console.error(error);

        this.messageService.add({
          key: 'central',
          severity: 'error',
          summary: 'Pogreška prilikom dohvaćanja',
          detail:
            'Nešto je pošlo po krivu tijekom dohvaćanja zadataka. Pokušaj ponovno kasnije!',
        });
      },
    });
  }

  onTaskSelected(task: BasicTask) {
    this.router.navigateByUrl(`/prog/${task.id}`);
  }
}
