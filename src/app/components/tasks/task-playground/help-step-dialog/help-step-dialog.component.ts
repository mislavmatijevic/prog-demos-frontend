import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { firstValueFrom } from 'rxjs';
import { standardCppStarterCode } from '../../../../../helpers/editor-helpers';
import { HelpStep } from '../../../../../types/models';
import { TaskHelpStepService } from '../../../../services/task-help-step.service';
import { EditorComponent } from '../../../editor/editor.component';

@Component({
  selector: 'app-help-step-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, EditorComponent],
  templateUrl: './help-step-dialog.component.html',
  styleUrl: './help-step-dialog.component.scss',
})
export class HelpStepDialogComponent implements OnChanges {
  constructor(
    private taskHelpStepService: TaskHelpStepService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input() taskId: number = 0;

  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Output() isReadyForNewHelp = new EventEmitter<boolean>();

  dialogTitle: string = '💡 Pomoć';

  codeShown: boolean = false;
  textShown: boolean = false;

  nextHelpStep = 1;
  previouslyGivenCodeHelp: string = '';
  diffEditorLeftState: string = '';
  diffEditorRightSide: string = '';
  nextHelpCooldownRemainingTime = 0;
  helpCooldownIntervalHandler: number = -1;
  resizeEvent: UIEvent = new UIEvent('init');

  helpText: string = '';
  infoMessage: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      const visibilityChange = changes['visible'];
      if (
        visibilityChange.previousValue === false &&
        visibilityChange.currentValue === true &&
        this.nextHelpStep !== -1
      ) {
        this.displayNextHelpStep();
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

    if (this.nextHelpStep === -1) {
      this.isReadyForNewHelp.emit(true);
    }
  }

  async displayNextHelpStep() {
    const newHelpStep = await this.displayHelp(this.nextHelpStep);

    if (newHelpStep !== null) {
      this.startHelpCooldown(this.nextHelpStep * 10);
      this.nextHelpStep++;
    } else {
      this.infoMessage = 'Ne mogu ti dati više pomoći, dalje moraš samostalno.';
      this.isReadyForNewHelp.emit(true);
      this.nextHelpStep = -1;
    }
  }

  private async displayHelp(step: number): Promise<HelpStep | null> {
    try {
      const requestedHelp = await firstValueFrom(
        this.taskHelpStepService.getHelpStep(this.taskId, step)
      );

      if (!requestedHelp.success) {
        return null;
      }

      const nextHelpStep = requestedHelp.helpStep;
      this.handleDisplayingHelp(nextHelpStep);

      return nextHelpStep;
    } catch (error) {
      return null;
    }
  }

  private startHelpCooldown(seconds: number) {
    this.nextHelpCooldownRemainingTime = seconds;

    this.helpCooldownIntervalHandler = setInterval(() => {
      if (this.nextHelpCooldownRemainingTime == 0) {
        clearTimeout(this.helpCooldownIntervalHandler);
        this.isReadyForNewHelp.emit(true);
      } else {
        this.nextHelpCooldownRemainingTime--;
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

    this.dialogTitle = `💡 ${helpStep.step}. pomoć za ovaj zadatak`;
  }

  private async showCodeDifferenceFromHelpStep(currentHelpStep: HelpStep) {
    let previousCode: string;

    try {
      const previousHelpStep = await firstValueFrom(
        this.taskHelpStepService.getHelpStep(
          this.taskId,
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
