import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { MessageService } from 'primeng/api';
import { BasicTask, Topic } from '../../../types/models';
import { TaskCardComponent } from '../../components/tasks/task-card/task-card.component';
import { AuthService } from '../../services/auth.service';
import { TaskService, TasksResponse } from '../../services/task.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, TaskCardComponent, AccordionModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent implements OnInit {
  constructor(
    private taskService: TaskService,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  topics: Topic[] = [];
  currentTabIndex: number = 0;

  ngOnInit() {
    this.fetchTasks();
    this.reopenLastViewedTab();
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
    this.router.navigateByUrl(`/prog/${task.identifier}`);
  }

  sort(tasks: BasicTask[]): BasicTask[] {
    return tasks.sort((task1, task2) => task1.identifier - task2.identifier);
  }

  handleTabChange(newTabIndex: number | number[]) {
    if (this.authService.isLoggedIn()) {
      localStorage.setItem('last-opened-task-tab', newTabIndex.toString());
    }
  }

  private reopenLastViewedTab() {
    if (this.authService.isLoggedIn()) {
      const number = localStorage.getItem('last-opened-task-tab');
      if (number !== null) {
        this.currentTabIndex = parseInt(number);
      }
    }
  }
}
