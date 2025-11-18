import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { firstValueFrom } from 'rxjs';
import { standardCppStarterCode } from '../../../../../helpers/editor-helpers';
import { BasicTask, HelpStep } from '../../../../../types/models';
import { AuthService } from '../../../../services/auth.service';
import { TaskHelpStepService } from '../../../../services/task-help-step.service';
import { EditorComponent } from '../../../editor/editor.component';

type HelpStepTab = {
  step: number;
  isCurrent: boolean;
  isUnlocked: boolean;
};

@Component({
  selector: 'app-help-step-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, EditorComponent, FormsModule],
  templateUrl: './help-step-dialog.component.html',
  styleUrl: './help-step-dialog.component.scss',
})
export class HelpStepDialogComponent implements OnInit, OnChanges {
  constructor(
    private authService: AuthService,
    private taskHelpStepService: TaskHelpStepService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input({ required: true }) task!: BasicTask;

  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Output() onCountdown = new EventEmitter<number>();

  dialogTitle: string = '💡 Pomoć';

  codeShown: boolean = false;
  textShown: boolean = false;

  getCurrentHelpStepTab = () =>
    this.helpStepTabs.find((v) => v.isCurrent) ?? this.helpStepTabs[0];
  getNextLockedHelpStep = () => this.helpStepTabs.find((v) => !v.isUnlocked);
  helpStepTabs: Array<HelpStepTab> = [];
  previouslyGivenCodeHelp: string = '';
  diffEditorLeftState: string = '';
  diffEditorRightSide: string = '';
  countdownInProgress = false;
  nextHelpCooldownRemainingTime = 0;
  helpCooldownIntervalHandler: number = -1;
  resizeEvent: UIEvent = new UIEvent('init');

  helpText: string = '';
  infoMessage: string = '';

  ngOnInit(): void {
    this.taskHelpStepService.getHelpStepCount(this.task.id).subscribe({
      next: (helpStepCount) => {
        this.helpStepTabs = Array<HelpStepTab>(helpStepCount)
          .fill({ step: 0, isCurrent: false, isUnlocked: false })
          .map((_, i) => {
            return {
              step: i + 1,
              isCurrent: i == 0,
              isUnlocked: i == 0,
            };
          });
        this.displayCurrentHelp();
      },
    });

    if (this.authService.isLoggedIn()) {
      this.taskHelpStepService
        .getLatestAvailableHelpStep(this.task.id)
        .subscribe({
          next: (latestAvailableStep) => {
            for (const tab of this.helpStepTabs) {
              if (tab.step <= latestAvailableStep) {
                tab.isUnlocked = true;
              }
            }
          },
        });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      const visibilityChange = changes['visible'];
      if (
        visibilityChange.previousValue === false &&
        visibilityChange.currentValue === true
      ) {
        this.displayCurrentHelp();
        this.handleResize(new UIEvent('reopen'));
      }
    }
  }

  handleResize(event: UIEvent) {
    this.resizeEvent = new UIEvent('change');
    this.changeDetectorRef.detectChanges();
    this.resizeEvent = event;
  }

  handleHide() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  async countdownUntilNextHelpStep() {
    const nextLockedStep = this.getNextLockedHelpStep();
    if (nextLockedStep === undefined) {
      return;
    }

    this.nextHelpCooldownRemainingTime = nextLockedStep.step * 2;
    const cooldownComplexityModifier = parseInt(this.task.complexity) * 3;
    if (cooldownComplexityModifier > 0) {
      this.nextHelpCooldownRemainingTime += cooldownComplexityModifier;
    }

    this.countdownInProgress = true;
    this.onCountdown.emit(this.nextHelpCooldownRemainingTime);

    this.helpCooldownIntervalHandler = setInterval(() => {
      if (this.nextHelpCooldownRemainingTime == 0) {
        this.countdownInProgress = false;
        clearTimeout(this.helpCooldownIntervalHandler);
        this.handleCooldownComplete(nextLockedStep);
        this.onCountdown.emit(0);
      } else {
        this.onCountdown.emit(this.nextHelpCooldownRemainingTime--);
      }
    }, 1000) as unknown as number;
  }

  private handleCooldownComplete(newlyUnlockedStep: HelpStepTab) {
    newlyUnlockedStep.isUnlocked = true;
    this.setCurrentTab(newlyUnlockedStep);

    if (this.authService.isLoggedIn()) {
      this.taskHelpStepService.makeHelpStepAvailable(
        this.task.id,
        newlyUnlockedStep.step
      );
    }
  }

  protected async displayNewHelpStep(tab: HelpStepTab) {
    if (!tab.isCurrent && tab.isUnlocked) {
      this.setCurrentTab(tab);
    }
  }

  private async displayCurrentHelp() {
    const currentTab = this.getCurrentHelpStepTab();

    const requestedHelp = await firstValueFrom(
      this.taskHelpStepService.getHelpStep(this.task.id, currentTab.step)
    );

    const displayedHelpStep = requestedHelp.helpStep;
    this.handleDisplayingHelp(displayedHelpStep);
    this.taskHelpStepService.persistHelpSteps();
  }

  private setCurrentTab(tab: HelpStepTab) {
    this.getCurrentHelpStepTab().isCurrent = false;
    tab.isCurrent = true;
    this.displayCurrentHelp();
  }

  private handleDisplayingHelp(helpStep: HelpStep) {
    const foundHelpfulCodeStep: string | undefined = helpStep.helperCode;
    const foundHelpfulTip: string | undefined = helpStep.helperText;

    this.codeShown = false;
    this.textShown = false;
    this.changeDetectorRef.detectChanges();

    if (foundHelpfulCodeStep !== undefined && foundHelpfulCodeStep !== null) {
      this.showCodeDifferenceFromHelpStep(helpStep);
      this.codeShown = true;
    }
    if (foundHelpfulTip !== undefined && foundHelpfulTip !== null) {
      this.showHelpText(foundHelpfulTip);
      this.textShown = true;
    }

    this.dialogTitle = `💡 ${this.getTitleForStep(
      helpStep.step
    )} za ovaj zadatak`;
  }

  protected getTitleForStep(helpStepIndex: number): string {
    return `${helpStepIndex}. korak pomoći`;
  }

  private async showCodeDifferenceFromHelpStep(currentHelpStep: HelpStep) {
    let previousCode: string;

    try {
      const previousHelpStep = await firstValueFrom(
        this.taskHelpStepService.getHelpStep(
          this.task.id,
          currentHelpStep.step - 1
        )
      );
      previousCode = previousHelpStep.helpStep.helperCode;
    } catch (error) {
      previousCode = standardCppStarterCode;
    }

    this.diffEditorLeftState = previousCode;
    this.diffEditorRightSide = currentHelpStep.helperCode;
  }

  private showHelpText(helpMessageForCurrentStep: string) {
    this.helpText = helpMessageForCurrentStep;
  }
}
