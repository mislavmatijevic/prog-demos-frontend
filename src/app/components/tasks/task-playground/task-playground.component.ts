import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
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
import { EditorComponent, SyntaxError } from '../../editor/editor.component';
import { LoginComponent } from '../../login/login.component';
import { RegisterComponent } from '../../register/register.component';

enum SolutionErrorCode {
  EXEC_ERR_BAD_SYNTAX = 1,
  EXEC_ERR_TEST_FAILED = 2,
  EXEC_ERR_TIMEOUT = 3,
  EXEC_ERR_KILLED = 4,
  EXEC_ERR_ARTEFACT_CONTENT_MISMATCH = 5,
}

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

  isScreenWideEnoughForProgramming: boolean = false;

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
    this.isScreenWideEnoughForProgramming = window.screen.width > 355;

    const taskId = parseInt(this.route.snapshot.paramMap.get('taskId')!);
    this.fetchTask(taskId);
    this.startHelpCooldown(5);
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

  private fetchTask(videoId: number) {
    this.taskService.getSingleTask(videoId).subscribe({
      next: (res: TaskResponse) => {
        this.task = res.task;
        this.mainCode = standardCppStarterCode;
        this.task.helpSteps.sort((step1, step2) => step1.step - step2.step);
      },
      error: (error) => {
        console.error(error);

        this.messageService.add({
          severity: 'error',
          summary: 'Pogreška prilikom učitavanja',
          detail:
            'Nešto je pošlo po krivu tijekom učitavanja zadatka. Pokušaj ponovno kasnije!',
        });
      },
    });
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
        next: (value) => {
          // TODO handle actual response better
          this.forceHideDiffEditor();

          this.messageService.add({
            severity: 'success',
            summary: 'Sjajno!',
            detail: 'Čini se da je ovo ispravno rješenje, bravo!',
          });
        },
        error: (err) => {
          if (err instanceof HttpErrorResponse) {
            switch (err.status) {
              case 403: // token refresh should be in progress
                break;
              case 422:
                this.handleSolutionEvaluationFailure(
                  err.error.errorCode,
                  err.error.reason
                );
                break;

              case 500:
                this.messageService.add({
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

  private handleSolutionEvaluationFailure(
    errorCode: SolutionErrorCode,
    reasonFailed?: any
  ) {
    switch (errorCode) {
      case SolutionErrorCode.EXEC_ERR_BAD_SYNTAX: {
        this.handleBadSyntax(reasonFailed);
        break;
      }
      case SolutionErrorCode.EXEC_ERR_TEST_FAILED: {
        this.handleTestFailure(reasonFailed);
        break;
      }
      case SolutionErrorCode.EXEC_ERR_TIMEOUT: {
        this.messageService.add({
          severity: 'error',
          summary: 'Izvršavanje trajalo predugo!',
          detail:
            'Vjerojatan uzrok problema jest neka beskonačna petlja koja ti se potkrala. Provjeri sve petlje još jednom!',
          life: 120000,
        });
        break;
      }
      case SolutionErrorCode.EXEC_ERR_KILLED: {
        this.messageService.add({
          severity: 'error',
          summary: 'Izvršavanje prisilno obustavljeno!',
          detail:
            'Vjerojatan uzrok problema je tzv. "memory leak". Najvjerojatnije imaš neku petlju u kojoj alociraš beskonačno mnogo prostora. ' +
            'Moj savjet je da pretražiš sva mjesta gdje koristiš naredbu "new" i osiguraš da se ona ne izvršava beskonačno.',
          life: 120000,
        });
        break;
      }
      case SolutionErrorCode.EXEC_ERR_ARTEFACT_CONTENT_MISMATCH: {
        const actualReason = reasonFailed as { testInput: string };

        this.messageService.add({
          severity: 'error',
          detail: `Nisu se stvorile odgovarajuće datoteke za dani unos: ${actualReason.testInput}`,
        });
        break;
      }
      default:
        break;
    }
  }

  handleBadSyntax(syntaxErrors: Array<SyntaxError>) {
    this.syntaxErrors = syntaxErrors;
  }

  private handleTestFailure(reasonFailed: {
    testInput: string;
    output: string;
    expectedOutput: string;
  }) {
    this.forceHideDiffEditor();

    this.diffEditorLeftState = reasonFailed.output ?? '';
    this.diffEditorRightSide = reasonFailed.expectedOutput;
    this.diffEditorShown = true;

    this.messageService.add({
      severity: 'error',
      summary: 'Rješenje nije proizvelo očekivani rezultat!',
      detail: `Kada se tvoje rješenje testira s unosom "${reasonFailed.testInput}", izlaz tvog programa se ne podudara s očekivanim za taj ulaz.`,
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
}
