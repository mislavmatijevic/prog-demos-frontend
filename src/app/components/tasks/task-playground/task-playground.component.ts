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
import { finalize } from 'rxjs';
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

  bitCode: string = '';
  isBeingTestedRemotely: boolean = false;
  bitAnimationHandler: Array<number> = [];

  helpStepIndex = 0;
  codeHelpShown: boolean = false;
  helpButtonRageTolerance = 5;

  loginDialogVisible: boolean = false;

  coolMessageIndex = -1;
  coolMessages = [
    'Da vidimo...',
    'Hmmm...',
    'Tako dakle...',
    'Sad ću ja to...',
    'Pričekaj malo!',
    'Zanimljivo...',
  ];

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
        this.task.helpSteps.sort((step1, step2) => step1.step - step2.step);
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
      this.showHelp();
    } else {
      this.hideHelp();
    }
  }

  async executeCode() {
    if (this.authService.isLoggedIn()) {
      if (this.mainCode !== undefined && this.mainCode !== '') {
        this.animateCodeTransferToBits();
        this.handleTaskExecution();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Neće ići',
          detail: 'Ne mogu testirati prazan kod!',
        });
      }
    } else {
      this.loginDialogVisible = true;
    }
  }

  handleLoginSuccessful() {
    this.loginDialogVisible = false;
  }

  handleRegistrationSuccessful() {
    this.loginDialogVisible = false;
  }

  private showHelp() {
    if (this.helpStepIndex == 0) {
      this.initialCodeForFirstStepHelpComparison();
    } else if (this.helpStepIndex >= this.task.helpSteps.length) {
      this.handleHelpButtonWhenNoMoreHelpAvailable();
      return;
    }

    const thisHelpStep = this.task.helpSteps[this.helpStepIndex];

    let foundHelpfulCodeStep = thisHelpStep.helperCode;
    let foundHelpfulTip = thisHelpStep.helperText;

    this.handleDisplayingHelp(foundHelpfulCodeStep, foundHelpfulTip);

    this.helpStepIndex++;
  }

  handleHelpButtonWhenNoMoreHelpAvailable() {
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

  private hideHelp() {
    this.codeHelpShown = false;
  }

  private initialCodeForFirstStepHelpComparison() {
    this.helpSuggestionCode = standardCppStarterCode;
  }

  private handleDisplayingHelp(
    foundHelpfulCodeStep: string | undefined,
    foundHelpfulTip: string | undefined
  ) {
    if (foundHelpfulCodeStep !== undefined && foundHelpfulCodeStep !== null) {
      this.showCodeDifference(foundHelpfulCodeStep);
    }
    if (foundHelpfulTip !== undefined && foundHelpfulTip !== null) {
      this.displayHelpToast(foundHelpfulTip);
    }
  }

  private showCodeDifference(foundHelpfulCodeStep: string) {
    this.helpPreviousCode = this.helpSuggestionCode;
    this.helpSuggestionCode = foundHelpfulCodeStep;
    this.codeHelpShown = true;
  }

  private displayHelpToast(helpMessageForCurrentStep: string) {
    if (helpMessageForCurrentStep != '') {
      this.messageService.add({
        severity: 'info',
        summary: 'Moj savjet',
        detail: helpMessageForCurrentStep,
        life: 30000,
      });
    }
  }

  private animateCodeTransferToBits() {
    this.bitCode = this.mainCode!;

    while (this.bitCode!.length! % 18 != 0) {
      this.bitCode += ' ';
    }

    const codeLength = this.bitCode!.length!;

    for (let i = 0; i <= codeLength; i++) {
      this.bitAnimationHandler.push(
        setTimeout(() => {
          this.bitCode = this.transformToMockByteStream(this.bitCode, i);
        }, 5 * i) as unknown as number
      );
    }
  }

  private transformToMockByteStream(
    currentStream: string,
    index: number
  ): string {
    let stream = currentStream;

    const setCharAt = (str: string, index: number, replacement: string) =>
      str.substring(0, index - 1) +
      replacement +
      str.substring(index + replacement.length - 1);

    const thisBit = (currentStream.charCodeAt(index) % 2).toString();
    stream = setCharAt(stream, index, thisBit);

    if (index != 0 && index % 18 == 0) {
      stream = setCharAt(stream, index, `\n`);
    }

    return stream;
  }

  private handleTaskExecution() {
    this.isBeingTestedRemotely = true;
    this.taskService
      .executeTask(this.task.id, this.mainCode!)
      .pipe(finalize(() => this.revertBitsAfterExecution()))
      .subscribe({
        // TODO handle actual responses better
        next: (value) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sjajno!',
            detail: 'Čini se da je ovo ispravno rješenje, bravo!',
          });
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ups',
            detail: 'Čini se da tvoje rješenje još uvijek nije potpuno...',
          });
        },
      });

    this.coolMessageIndex = Math.abs(
      Math.trunc((Math.random() * 15) % this.coolMessages.length)
    );
  }

  private revertBitsAfterExecution() {
    while (this.bitAnimationHandler.length > 0) {
      clearTimeout(this.bitAnimationHandler.pop());
    }
    this.isBeingTestedRemotely = false;
  }
}
