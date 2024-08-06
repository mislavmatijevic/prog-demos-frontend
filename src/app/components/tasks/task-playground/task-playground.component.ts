import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MonacoEditorModule, NgxEditorModel } from 'ngx-monaco-editor-v2';
import { Button } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';
import { FullTask } from '../../../../types/models';
import { NewlinePipe } from '../../../pipes/newline.pipe';
import { TaskResponse, TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-task-playground',
  standalone: true,
  imports: [
    CommonModule,
    MonacoEditorModule,
    NewlinePipe,
    Button,
    OverlayPanelModule,
    TooltipModule,
  ],
  providers: [NewlinePipe],
  templateUrl: './task-playground.component.html',
  styleUrl: './task-playground.component.scss',
})
export class TaskPlaygroundComponent {
  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private newlinePipe: NewlinePipe,
    private clipboard: Clipboard
  ) {}

  task!: FullTask;
  editor!: any;
  editorModel: NgxEditorModel = {
    value: '// Učitavanje početnog koda',
    language: 'cpp',
  };
  editorOptions = {
    theme: 'vs-dark',
    language: 'cpp',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    automaticLayout: true,
  };
  maximizeCodeHeight: boolean = false;

  ngOnInit() {
    const taskId = parseInt(this.route.snapshot.paramMap.get('taskId')!);
    this.fetchTask(taskId);
  }

  onEditorReady($event: any) {
    fetch('assets/monaco-theme/prog-demos-theme.json')
      .then((data) => data.json())
      .then((data) => {
        $event._themeService.defineTheme('prog-demos-theme', data);
        $event._themeService.setTheme('prog-demos-theme');
      });
    this.editor = $event;
  }

  fetchTask(videoId: number) {
    this.taskService.getSingleTask(videoId).subscribe({
      next: (res: TaskResponse) => {
        this.task = res.task;
        this.editorModel.value = this.newlinePipe.transform(
          this.task.starter_code
        );
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  expandCode() {
    this.maximizeCodeHeight = !this.maximizeCodeHeight;
  }

  copyCode() {
    this.clipboard.copy(this.editor.getValue());
  }

  giveHelp() {
    throw new Error('Method not implemented.');
  }
}
