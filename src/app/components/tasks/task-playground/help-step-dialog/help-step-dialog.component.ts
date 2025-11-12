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
import { TaskHelpStepService } from '../../../../services/task-help-step.service';
import { EditorComponent } from '../../../editor/editor.component';

@Component({
  selector: 'app-help-step-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, EditorComponent, FormsModule],
  templateUrl: './help-step-dialog.component.html',
  styleUrl: './help-step-dialog.component.scss',
})
export class HelpStepDialogComponent implements OnInit, OnChanges {
  constructor(
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

  currentHelpStep = 1;
  maxUnlockedHelpStep = 1;
  numberOfHelpSteps: Array<number> = [];
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
        this.numberOfHelpSteps = Array(helpStepCount)
          .fill(0)
          .map((_, i) => i + 1);
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      const visibilityChange = changes['visible'];
      if (
        visibilityChange.previousValue === false &&
        visibilityChange.currentValue === true
      ) {
        this.displayHelp(this.maxUnlockedHelpStep);
        this.handleResize(new UIEvent('reopen'));
        if (!this.countdownInProgress) {
          this.countdownUntilNextHelpStep();
        }
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
    if (this.maxUnlockedHelpStep <= this.numberOfHelpSteps.length) {
      let cooldownSeconds = this.maxUnlockedHelpStep * 2;
      const cooldownComplexityModifier = parseInt(this.task.complexity) * 3;
      if (cooldownComplexityModifier > 0) {
        cooldownSeconds += cooldownComplexityModifier;
      }
      this.startHelpCooldown(cooldownSeconds);
    } else {
      this.onCountdown.emit(0);
    }
  }

  protected async onNewHelpStepClick(step: number) {
    console.log('step: ', step);
    console.log('this.currentHelpStep: ', this.maxUnlockedHelpStep);
    if (step != this.currentHelpStep) {
      this.displayHelp(step);
    }
  }

  private async displayHelp(step: number) {
    if (step > this.maxUnlockedHelpStep) {
      return;
    }

    const requestedHelp = await firstValueFrom(
      this.taskHelpStepService.getHelpStep(this.task.id, step)
    );

    const displayedHelpStep = requestedHelp.helpStep;
    this.handleDisplayingHelp(displayedHelpStep);
  }

  private startHelpCooldown(seconds: number) {
    this.countdownInProgress = true;
    this.nextHelpCooldownRemainingTime = seconds;
    this.onCountdown.emit(this.nextHelpCooldownRemainingTime);

    this.helpCooldownIntervalHandler = setInterval(() => {
      if (this.nextHelpCooldownRemainingTime == 0) {
        clearTimeout(this.helpCooldownIntervalHandler);
        this.onCountdown.emit(0);
        this.maxUnlockedHelpStep++;
        this.countdownInProgress = false;
      } else {
        this.onCountdown.emit(this.nextHelpCooldownRemainingTime--);
      }
    }, 1000) as unknown as number;
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

    this.currentHelpStep = helpStep.step;
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
