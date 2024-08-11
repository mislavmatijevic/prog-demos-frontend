import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  DiffEditorModel,
  MonacoEditorModule,
  NgxEditorModel,
} from 'ngx-monaco-editor-v2';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ToastModule } from 'primeng/toast';
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
    ToastModule,
  ],
  providers: [NewlinePipe, MessageService],
  templateUrl: './task-playground.component.html',
  styleUrl: './task-playground.component.scss',
})
export class TaskPlaygroundComponent {
  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private newlinePipe: NewlinePipe,
    private clipboard: Clipboard,
    private messageService: MessageService
  ) {}

  task!: FullTask;
  editor!: any;
  diffEditor!: any;
  editorModel: NgxEditorModel = {
    value: '// Učitavanje početnog koda',
    language: 'cpp',
  };
  helpPreviousEditorModel: DiffEditorModel = {
    code: '',
    language: 'cpp',
  };
  helpSuggestionEditorModel: DiffEditorModel = {
    code: '',
    language: 'cpp',
  };
  editorOptions = {
    theme: 'prog-demos-theme',
    language: 'cpp',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    automaticLayout: true,
  };
  diffEditorOptions = {
    theme: 'prog-demos-theme',
    language: 'cpp',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    readonly: true,
  };
  maximizeCodeHeight: boolean = false;

  helpStepGiven: number = 0;
  codeHelpShown: boolean = false;
  helpButtonRageTolerance = 5;

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

  onDiffEditorReady($event: any) {
    this.diffEditor = null;
    this.diffEditor = $event;
    this.diffEditor.goToDiff();
  }

  fetchTask(videoId: number) {
    this.taskService.getSingleTask(videoId).subscribe({
      next: (res: TaskResponse) => {
        this.task = res.task;
        this.editorModel.value = this.newlinePipe.transform(
          this.task.starterCode
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
    this.messageService.add({
      severity: 'success',
      detail: 'Kod kopiran',
      life: 1000,
    });
  }

  toggleHelp() {
    if (!this.codeHelpShown) {
      this._showHelp();
    } else {
      this._hideHelp();
    }
  }

  _showHelp() {
    this.helpStepGiven++;
    let foundHelpfulCodeStep = undefined;
    let foundHelpfulTip = undefined;

    if (this.helpStepGiven == 1) {
      this._initialCodeForFirstStepHelpComparison();
    }

    foundHelpfulCodeStep = (this.task as any)[`step${this.helpStepGiven}Code`];
    foundHelpfulTip = (this.task as any)[`helper${this.helpStepGiven}Text`];
    const helpExistsForThisStep =
      foundHelpfulCodeStep !== undefined || foundHelpfulTip !== undefined;

    if (helpExistsForThisStep) {
      this._handleDisplayingHelp(foundHelpfulCodeStep, foundHelpfulTip);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'To je to od pomoći!',
        detail: 'Ne mogu ti dati više pomoći, dalje moraš samostalno.',
      });
      this.helpButtonRageTolerance--;
      if (this.helpButtonRageTolerance == 0) {
        this.messageService.add({
          severity: 'info',
          summary: 'Prestani klikati',
          detail:
            'Ok, pomoći ću ti tako da maknem gumb, pa da se fokusiraš na zadatak.',
          life: 5000,
        });
      }
    }
  }

  _hideHelp() {
    this.codeHelpShown = false;
  }

  private _handleDisplayingHelp(
    foundHelpfulCodeStep: string | undefined,
    foundHelpfulTip: string | undefined
  ) {
    if (foundHelpfulCodeStep !== undefined) {
      this._showCodeDifference(foundHelpfulCodeStep);
    }
    if (foundHelpfulTip !== undefined) {
      this._displayHelpToast(foundHelpfulTip);
    }
  }

  private _initialCodeForFirstStepHelpComparison() {
    this.helpSuggestionEditorModel = {
      code: this.newlinePipe.transform(this.task.starterCode),
      language: 'cpp',
    };
  }

  private _displayHelpToast(helpMessageForCurrentStep: string) {
    if (
      helpMessageForCurrentStep !== undefined &&
      helpMessageForCurrentStep != ''
    ) {
      this.messageService.add({
        severity: 'info',
        summary: 'Moj savjet',
        detail: helpMessageForCurrentStep,
        life: 30000,
      });
    }
  }

  private _showCodeDifference(foundHelpfulCodeStep: string) {
    this.helpPreviousEditorModel!.code = this.helpSuggestionEditorModel!.code;
    this.helpSuggestionEditorModel!.code =
      this.newlinePipe.transform(foundHelpfulCodeStep);
    this.codeHelpShown = true;
    setTimeout(() => {
      this.diffEditor.goToDiff();
    }, 500);
  }
}
