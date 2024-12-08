import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import confetti from 'canvas-confetti';
import { Message, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SplitterModule, SplitterResizeEndEvent } from 'primeng/splitter';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { standardCppStarterCode } from '../../../../helpers/editor-helpers';
import { sizes } from '../../../../styles/variables';
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
import { HelpStepDialogComponent } from './help-step-dialog/help-step-dialog.component';
import { OutputMismatchDialogComponent } from './output-mismatch-dialog/output-mismatch-dialog.component';
import { SuccessDialogComponent } from './success-dialog/success-dialog.component';

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
    SuccessDialogComponent,
    ToastModule,
    SplitterModule,
    HelpStepDialogComponent,
    OutputMismatchDialogComponent,
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
    private changeDetectorRef: ChangeDetectorRef,
    private titleService: Title
  ) {}

  task!: FullTask;
  mainCode: string | undefined = undefined;
  mainEditorReady: boolean = false;

  bitCode: string = '';
  isBeingTestedRemotely: boolean = false;
  bitAnimationHandler: Array<number> = [];

  syntaxErrors: Array<SyntaxError> = [];
  outputMismatchReportedFailure:
    | ExecutionFailureReasonOutputMismatch
    | undefined = undefined;

  loginDialogVisible: boolean = false;
  successDialogVisible: boolean = false;
  outputMismatchDialogVisible: boolean = false;

  helpDialogVisible: boolean = false;
  helpStepAvailable = true;

  isScreenWideEnoughForHorizontalSplitter: boolean = false;
  isScreenWideEnoughForProgramming: boolean = false;
  userAchievedScore: TaskScore | null = null;
  loadSuccessfulSolutionBtnVisible: boolean = false;

  lastSplitterResizedEvent: UIEvent = new UIEvent('init');

  coolMessageIndex = -1;
  coolMessages = [
    'Da vidimo...',
    'Hmmm...',
    'Tako dakle...',
    'Sad ću ja to...',
    'Pričekaj malo!',
    'Zanimljivo...',
  ];

  getTaskStorageKey = () => `playground-code-${this.task.identifier}`;

  ngOnInit() {
    this.isScreenWideEnoughForHorizontalSplitter =
      window.innerWidth > sizes.smallWidth;

    this.isScreenWideEnoughForProgramming =
      window.innerWidth > sizes.minProgrammingWidth;

    const taskIdentifier = parseInt(
      this.route.snapshot.paramMap.get('taskIdentifier')!
    );
    this.fetchTask(taskIdentifier);

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
    this.helpDialogVisible = !this.helpDialogVisible;
    if (this.helpDialogVisible) {
      this.helpStepAvailable = false;
    }
  }

  handleNewHelpStepReady() {
    this.helpStepAvailable = true;
  }

  async executeCode() {
    if (this.authService.isLoggedIn()) {
      if (this.mainCode !== undefined && this.mainCode !== '') {
        this.messageService.clear('central');
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

  showBestCode() {
    this.mainCode = undefined;
    this.changeDetectorRef.detectChanges();
    this.mainCode = this.task.bestSuccessfulSubmission?.submittedCode;
  }

  onLayoutResized(event: SplitterResizeEndEvent) {
    this.lastSplitterResizedEvent = event.originalEvent;
  }

  private saveCurrentCode(currentCode: string) {
    this.currentStorage().setItem(this.getTaskStorageKey(), currentCode);
  }

  private fetchTask(taskIdentifier: number) {
    this.taskService.getSingleTaskByIdentifier(taskIdentifier).subscribe({
      next: (res: TaskResponse) => {
        this.task = res.task;
        if (this.task.bestSuccessfulSubmission) {
          this.userAchievedScore = this.task.bestSuccessfulSubmission.score;
          this.loadSuccessfulSolutionBtnVisible = true;
        }
        this.setStartingCodeInEditor();
        this.titleService.setTitle(this.task.name);
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
        }, 10 * i) as unknown as number
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
          this.userAchievedScore = value.score;
          this.successDialogVisible = true;
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
              case 429:
                this.messageService.add({
                  key: 'central',
                  severity: 'error',
                  summary: 'Preveliko opterećenje sustava!',
                  detail:
                    'Čini se da previše korisnika u ovome trenutku koristi stranicu. Molim te pokušaj za par trenutaka. ' +
                    'Ako se ova greška ponavlja, pričekaj nekoliko sati.',
                  life: 30000,
                });
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
      case SolutionErrorCode.EXEC_RUNTIME_ERROR: {
        this.handleRuntimeError();
        break;
      }
      case SolutionErrorCode.EXEC_ERR_ILLEGAL_OPERATION: {
        this.handleIllegalOperation();
        break;
      }
      case SolutionErrorCode.EXEC_ERR_FILE_SIZE_EXCEEDED: {
        this.handleFileSizeExceeded();
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
    const shouldCompareOutputs = reasonFailed.output !== undefined;

    if (shouldCompareOutputs) {
      if (reasonFailed.expectedOutput === undefined) {
        this.outputMismatchReportedFailure = undefined;
        this.changeDetectorRef.detectChanges();
      }
      this.outputMismatchReportedFailure = reasonFailed;

      this.outputMismatchDialogVisible = true;
    } else {
      let errorDetail: string;
      const failedAtLastTest = reasonFailed.testInput === undefined;
      if (failedAtLastTest) {
        errorDetail =
          'Svi testovi su prošli osim posljednjeg. Provjeri o čemu je riječ.';
      } else {
        errorDetail =
          'Tvoje rješenje nije ništa ispisalo! Osiguraj da se izvrši `cout` naredba.';
      }

      this.messageService.add({
        key: 'central',
        severity: 'error',
        summary: 'Testiranje nije uspjelo!',
        detail: errorDetail,
        life: 120000,
      });
    }
  }

  private handleArtefactMismatch(reason: ExecutionFailureReasonTests) {
    const messageSuffix =
      reason.testInput !== undefined
        ? ` za dani unos: ${reason.testInput}`
        : `.`;

    this.messageService.add({
      key: 'central',
      severity: 'error',
      detail: `Nisu se stvorile odgovarajuće datoteke${messageSuffix}`,
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

  private handleRuntimeError() {
    this.messageService.add({
      key: 'central',
      severity: 'error',
      summary: 'Izvršavanje nije uspjelo!',
      detail:
        'Pregledaj još jednom svoj kod. On se uspio prevesti, ali je prijavljena pogreška pri izvršavanju.',
      life: 120000,
    });
  }

  private handleIllegalOperation() {
    this.messageService.add({
      key: 'hackerman-easter-egg',
      summary: '?',
      detail: 'Ti si neki',
      life: 120000,
    });
  }

  private handleFileSizeExceeded() {
    this.messageService.add({
      key: 'central',
      severity: 'error',
      summary: 'Datoteka je prešla ograničenje veličine!',
      detail:
        'Vjerojatan uzrok problema je upis podataka u datoteku koji ondje ne pripadaju. ' +
        'Moj savjet je da pretražiš sva mjesta gdje upisuješ sadržaj u datoteku i osiguraš da se u datoteku upisuje samo onaj sadržaj koji se očekuje.',
      life: 120000,
    });
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
