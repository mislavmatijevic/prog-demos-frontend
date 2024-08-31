import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { standardCppStarterCode } from '../../../../helpers/editor-helpers';
import { FullTask } from '../../../../types/models';
import { NewlinePipe } from '../../../pipes/newline.pipe';
import { AuthService } from '../../../services/auth.service';
import { TaskResponse, TaskService } from '../../../services/task.service';
import { EditorComponent } from '../../editor/editor.component';
import { LoginComponent } from '../../login/login.component';
import { RegisterComponent } from '../../register/register.component';

@Component({
  selector: 'app-task-playground',
  standalone: true,
  imports: [
    CommonModule,
    NewlinePipe,
    Button,
    OverlayPanelModule,
    TooltipModule,
    DialogModule,
    LoginComponent,
    DividerModule,
    RegisterComponent,
    ProgressSpinnerModule,
    EditorComponent,
  ],
  templateUrl: './task-playground.component.html',
  styleUrl: './task-playground.component.scss',
})
export class TaskPlaygroundComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private clipboard: Clipboard,
    private messageService: MessageService,
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  task!: FullTask;
  helpPreviousCode: string = '';
  helpSuggestionCode: string = '';
  mainCode: string | undefined = undefined;
  mainEditorReady: boolean = false;
  maximizeCodeHeight: boolean = false;

  helpStepGiven: number = 0;
  codeHelpShown: boolean = false;
  helpButtonRageTolerance = 5;

  loginDialogVisible: boolean = false;

  ngOnInit() {
    const taskId = parseInt(this.route.snapshot.paramMap.get('taskId')!);
    this.fetchTask(taskId);
  }

  onMainEditorReady() {
    this.mainEditorReady = true;
    this.changeDetectorRef.detectChanges();
  }

  fetchTask(videoId: number) {
    this.taskService.getSingleTask(videoId).subscribe({
      next: (res: TaskResponse) => {
        this.task = res.task;
        this.mainCode = standardCppStarterCode;
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
    this.clipboard.copy(this.mainCode!);
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

  executeCode() {
    if (this.authService.isLoggedIn()) {
      // TODO: await task execution
    } else {
      this.loginDialogVisible = true;
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

  handleLoginSuccessful() {
    this.loginDialogVisible = false;
  }

  handleRegistrationSuccessful() {
    this.loginDialogVisible = false;
  }

  private _initialCodeForFirstStepHelpComparison() {
    this.helpSuggestionCode = standardCppStarterCode;
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

  private _showCodeDifference(foundHelpfulCodeStep: string) {
    this.helpPreviousCode = this.helpSuggestionCode;
    this.helpSuggestionCode = foundHelpfulCodeStep;
    this.codeHelpShown = true;
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
}
