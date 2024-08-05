import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MonacoEditorModule, NgxEditorModel } from 'ngx-monaco-editor-v2';
import { FullTask } from '../../../../types/models';
import { TaskResponse, TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-task-playground',
  standalone: true,
  imports: [CommonModule, MonacoEditorModule],
  templateUrl: './task-playground.component.html',
  styleUrl: './task-playground.component.scss',
})
export class TaskPlaygroundComponent {
  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService
  ) {}

  task!: FullTask;
  editorModel: NgxEditorModel = {
    value: '// Učitavanje početnog koda',
    language: 'cpp',
  };
  editorOptions = { theme: 'vs-dark', language: 'cpp' };

  ngOnInit() {
    const taskId = parseInt(this.route.snapshot.paramMap.get('taskId')!);
    this.fetchVideo(taskId);
  }

  onEditorReady($event: any) {
    fetch('assets/monaco-theme/prog-demos-theme.json')
      .then((data) => data.json())
      .then((data) => {
        $event._themeService.defineTheme('prog-demos-theme', data);
        $event._themeService.setTheme('prog-demos-theme');
      });
  }

  fetchVideo(videoId: number) {
    this.taskService.getSingleTask(videoId).subscribe({
      next: (res: TaskResponse) => {
        this.task = res.task;
        this.editorModel.value = `${this.task.starter_code.replaceAll(
          '\\n',
          '\n'
        )}`;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
