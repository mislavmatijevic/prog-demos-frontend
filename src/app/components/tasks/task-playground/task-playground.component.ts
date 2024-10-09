import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import confetti from 'canvas-confetti';
import { Message, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { standardCppStarterCode } from '../../../../helpers/editor-helpers';
import { FullTask, TaskScore } from '../../../../types/models';
import { NewlinePipe } from '../../../pipes/newline.pipe';
import { AuthService } from '../../../services/auth.service';
import {
  ExecutionFailureReasonOutputMismatch,
  ExecutionFailureReasonTests,
  FailedTaskExecutionResponse,
  SolutionErrorCode,
  TaskResponse,
  TaskService,
} from '../../../services/task.service';
import { EditorComponent, SyntaxError } from '../../editor/editor.component';
import { LoginComponent } from '../../login/login.component';
import { RegisterComponent } from '../../register/register.component';
import { TaskScoreGraphComponent } from '../task-score-graph/task-score-graph.component';

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
    TaskScoreGraphComponent,
  ],
  templateUrl: './task-playground.component.html',
  styleUrl: './task-playground.component.scss',
})
export class TaskPlaygroundComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private clipboard: Clipboard,
    private messageService: MessageService,
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  task!: FullTask;
  diffEditorLeftState: string = '';
  diffEditorRightSide: string = '';
  previouslyGivenCodeHelp: string = '';
  mainCode: string | undefined = undefined;
  mainEditorReady: boolean = false;
  maximizeCodeWidth: boolean = false;

  bitCode: string = '';
  isBeingTestedRemotely: boolean = false;
  bitAnimationHandler: Array<number> = [];

  syntaxErrors: Array<SyntaxError> = [];

  helpStepIndex = 0;
  diffEditorShown: boolean = false;
  codeHelpShown: boolean = false;
  helpButtonRageTolerance = 5;
  nextHelpCooldownRemainingTime = 0;
  helpCooldownIntervalHandler: number = -1;

  loginDialogVisible: boolean = false;
  scoresDialogVisible: boolean = false;

  isScreenWideEnoughForProgramming: boolean = false;
  userAchievedScore: TaskScore | null = null;

  coolMessageIndex = -1;
  coolMessages = [
    'Da vidimo...',
    'Hmmm...',
    'Tako dakle...',
    'Sad ću ja to...',
    'Pričekaj malo!',
    'Zanimljivo...',
  ];

  getTaskStorageKey = () => `playground-code-${this.task.id}`;

  ngOnInit() {
    this.isScreenWideEnoughForProgramming = window.screen.width > 355;

    const taskId = parseInt(this.route.snapshot.paramMap.get('taskId')!);
    this.fetchTask(taskId);

    if (!this.authService.isLoggedIn()) {
      window.addEventListener('beforeunload', function (e) {
        e.preventDefault();
        this.confirm();
      });
    }
  }

  ngOnDestroy(): void {
    this.saveCurrentCode(this.mainCode!);
  }

  onMainEditorReady() {
    this.mainEditorReady = true;
    this.changeDetectorRef.detectChanges();
  }

  expandCode() {
    this.maximizeCodeWidth = !this.maximizeCodeWidth;
  }

  copyCode() {
    this.clipboard.copy(this.mainCode!);
    this.messageService.add({
      key: 'general',
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
          key: 'central',
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

  saveAndNotify(currentCode: string) {
    this.saveCurrentCode(currentCode);
    let messages: Array<Message> = [];

    messages.push({
      key: 'general',
      severity: 'success',
      detail: 'Trenutni kod spremljen!',
    });
    if (!this.authService.isLoggedIn()) {
      messages.push({
        key: 'general',
        severity: 'warn',
        detail:
          'Samo prijavljenim korisnicima napredak ostaje pohranjen i nakon zatvaranja stranice.',
        life: 10000,
      });
    }

    this.messageService.addAll(messages);
  }

  private saveCurrentCode(currentCode: string) {
    this.currentStorage().setItem(this.getTaskStorageKey(), currentCode);
  }

  private fetchTask(videoId: number) {
    this.taskService.getSingleTask(videoId).subscribe({
      next: (res: TaskResponse) => {
        this.task = res.task;
        this.setStartingCodeInEditor();
        this.task.helpSteps.sort((step1, step2) => step1.step - step2.step);
      },
      error: (error) => {
        console.error(error);

        this.messageService.add({
          key: 'central',
          severity: 'error',
          summary: 'Pogreška prilikom učitavanja',
          detail:
            'Nešto je pošlo po krivu tijekom učitavanja zadatka. Pokušaj ponovno kasnije!',
        });
      },
    });
  }

  private setStartingCodeInEditor() {
    const savedCode = this.currentStorage().getItem(this.getTaskStorageKey());
    if (savedCode !== null) {
      this.mainCode = savedCode;
    } else {
      this.mainCode = standardCppStarterCode;
    }
  }

  private startHelpCooldown(seconds: number) {
    this.nextHelpCooldownRemainingTime = seconds;

    this.helpCooldownIntervalHandler = setInterval(() => {
      if (this.nextHelpCooldownRemainingTime == 0) {
        clearTimeout(this.helpCooldownIntervalHandler);
      } else {
        this.nextHelpCooldownRemainingTime--;
      }
    }, 1000) as unknown as number;
  }

  private showHelp() {
    if (this.diffEditorShown) {
      this.diffEditorShown = false;
      this.changeDetectorRef.detectChanges();
    }

    if (this.helpStepIndex == 0) {
      this.previouslyGivenCodeHelp = standardCppStarterCode;
    } else if (this.helpStepIndex >= this.task.helpSteps.length) {
      this.handleHelpButtonWhenNoMoreHelpAvailable();
      return;
    }

    const thisHelpStep = this.task.helpSteps[this.helpStepIndex];

    let foundHelpfulCodeStep = thisHelpStep.helperCode;
    let foundHelpfulTip = thisHelpStep.helperText;

    this.handleDisplayingHelp(foundHelpfulCodeStep, foundHelpfulTip);

    this.helpStepIndex++;
    this.startHelpCooldown(this.helpStepIndex * 10);
  }

  handleHelpButtonWhenNoMoreHelpAvailable() {
    this.messageService.add({
      key: 'central',
      severity: 'error',
      summary: 'To je to od pomoći!',
      detail: 'Ne mogu ti dati više pomoći, dalje moraš samostalno.',
    });
    this.helpButtonRageTolerance--;
    if (this.helpButtonRageTolerance == 0) {
      this.messageService.add({
        key: 'central',
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
    this.diffEditorShown = false;
  }

  private handleDisplayingHelp(
    foundHelpfulCodeStep: string | undefined,
    foundHelpfulTip: string | undefined
  ) {
    if (foundHelpfulCodeStep !== undefined && foundHelpfulCodeStep !== null) {
      this.showCodeDifferenceFromHelpStep(foundHelpfulCodeStep);
    }
    if (foundHelpfulTip !== undefined && foundHelpfulTip !== null) {
      this.displayHelpToast(foundHelpfulTip);
    }
  }

  private showCodeDifferenceFromHelpStep(foundHelpfulCodeStep: string) {
    this.diffEditorLeftState = this.previouslyGivenCodeHelp;
    this.diffEditorRightSide = foundHelpfulCodeStep;
    this.diffEditorRightSide = foundHelpfulCodeStep;
    this.codeHelpShown = true;
    this.diffEditorShown = true;
  }

  private displayHelpToast(helpMessageForCurrentStep: string) {
    if (helpMessageForCurrentStep != '') {
      this.messageService.add({
        key: 'central',
        severity: 'info',
        summary: 'Moj savjet',
        detail: helpMessageForCurrentStep,
        life: 90000,
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
        next: (value) => {
          this.forceHideDiffEditor();
          this.userAchievedScore = value.score;
          this.scoresDialogVisible = true;

          this.messageService.add({
            key: 'central',
            severity: 'success',
            summary: 'Sjajno!',
            detail: 'Čini se da je ovo ispravno rješenje, bravo!',
          });

          this.popConfetti();
        },
        error: (err) => {
          if (err instanceof HttpErrorResponse) {
            var errorRes = err.error as FailedTaskExecutionResponse;
            switch (err.status) {
              case 403: // token refresh should be in progress
                break;
              case 422:
                this.handleSolutionEvaluationFailure(errorRes);
                break;

              case 500:
                this.messageService.add({
                  key: 'central',
                  severity: 'error',
                  summary: 'Dogodila se pogreška u sustavu!',
                  detail:
                    'Testiranje zadatka nije uspjelo iz nepoznatog razloga! ' +
                    'Ja ću pogledati o čemu je riječ, a ti u međuvremenu lokalno testiraj.',
                  life: 30000,
                });
                break;

              default:
                this.messageService.add({
                  key: 'central',
                  severity: 'error',
                  summary: 'Ups',
                  detail: 'Čini se da nije moguće testirati tvoje rješenje.',
                });
                break;
            }
          }
        },
      });

    this.coolMessageIndex = Math.abs(
      Math.trunc((Math.random() * 15) % this.coolMessages.length)
    );
  }

  private handleSolutionEvaluationFailure(error: FailedTaskExecutionResponse) {
    switch (error.errorCode) {
      case SolutionErrorCode.EXEC_ERR_BAD_SYNTAX: {
        this.handleBadSyntax(error.reason);
        break;
      }
      case SolutionErrorCode.EXEC_ERR_TEST_FAILED: {
        this.handleTestFailure(error.reason);
        break;
      }
      case SolutionErrorCode.EXEC_ERR_ARTEFACT_CONTENT_MISMATCH: {
        this.handleArtefactMismatch(error.reason);
        break;
      }
      case SolutionErrorCode.EXEC_ERR_TIMEOUT: {
        this.handleTimeout();
        break;
      }
      case SolutionErrorCode.EXEC_ERR_KILLED: {
        this.handleKilled();
        break;
      }
      default:
        break;
    }
  }

  handleBadSyntax(syntaxErrors: Array<SyntaxError>) {
    this.syntaxErrors = syntaxErrors;
  }

  private handleTestFailure(
    reasonFailed: ExecutionFailureReasonOutputMismatch
  ) {
    this.forceHideDiffEditor();

    this.diffEditorLeftState = reasonFailed.output ?? '';
    this.diffEditorRightSide = reasonFailed.expectedOutput;
    this.diffEditorShown = true;

    this.messageService.add({
      key: 'central',
      severity: 'error',
      summary: 'Rješenje nije proizvelo očekivani rezultat!',
      detail: `Kada se tvoje rješenje testira s unosom "${reasonFailed.testInput}", izlaz tvog programa se ne podudara s očekivanim za taj ulaz.`,
      life: 120000,
    });
  }

  private handleArtefactMismatch(reason: ExecutionFailureReasonTests) {
    this.messageService.add({
      key: 'central',
      severity: 'error',
      detail: `Nisu se stvorile odgovarajuće datoteke za dani unos: ${reason.testInput}`,
    });
  }

  private handleTimeout() {
    this.messageService.add({
      key: 'central',
      severity: 'error',
      summary: 'Izvršavanje trajalo predugo!',
      detail:
        'Vjerojatan uzrok problema jest neka beskonačna petlja koja ti se potkrala. Provjeri sve petlje još jednom!',
      life: 120000,
    });
  }

  private handleKilled() {
    this.messageService.add({
      key: 'central',
      severity: 'error',
      summary: 'Izvršavanje prisilno obustavljeno!',
      detail:
        'Vjerojatan uzrok problema je tzv. "memory leak". Najvjerojatnije imaš neku petlju u kojoj alociraš beskonačno mnogo prostora. ' +
        'Moj savjet je da pretražiš sva mjesta gdje koristiš naredbu "new" i osiguraš da se ona ne izvršava beskonačno.',
      life: 120000,
    });
  }

  private forceHideDiffEditor() {
    if (this.codeHelpShown) {
      this.hideHelp();
    } else if (this.diffEditorShown) {
      this.diffEditorShown = false;
    }
    this.changeDetectorRef.detectChanges();
  }

  private revertBitsAfterExecution() {
    while (this.bitAnimationHandler.length > 0) {
      clearTimeout(this.bitAnimationHandler.pop());
    }
    this.isBeingTestedRemotely = false;
  }

  private popConfetti() {
    confetti.reset();

    confetti({
      colors: ['#02c59b'],
      shapes: [
        confetti.shapeFromText({ text: '0', scalar: 2, color: '#ff007f' }),
        confetti.shapeFromText({ text: '1', scalar: 2, color: '#ff007f' }),
        confetti.shapeFromText({ text: '0', scalar: 2, color: '#00d4ff' }),
        confetti.shapeFromText({ text: '1', scalar: 2, color: '#00d4ff' }),
        confetti.shapeFromText({ text: '0', scalar: 2, color: '#7f00ff' }),
        confetti.shapeFromText({ text: '1', scalar: 2, color: '#7f00ff' }),
        confetti.shapeFromText({ text: '0', scalar: 2, color: '#adedfa' }),
        confetti.shapeFromText({ text: '1', scalar: 2, color: '#adedfa' }),
        confetti.shapeFromText({ text: '0', scalar: 2, color: '#ffcc7f' }),
        confetti.shapeFromText({ text: '1', scalar: 2, color: '#ffcc7f' }),
        confetti.shapeFromText({ text: '0', scalar: 2, color: '#ff8c00' }),
        confetti.shapeFromText({ text: '1', scalar: 2, color: '#ff8c00' }),
        'circle',
        'square',
      ],
      scalar: 2,
      drift: 0.5,
      gravity: 0.2,
      spread: 360,
      particleCount: 300,
      origin: { y: 0.5 },
      ticks: 500,
      startVelocity: 50,
    });
  }

  private currentStorage(): Storage {
    return this.authService.isLoggedIn() ? localStorage : sessionStorage;
  }
}
