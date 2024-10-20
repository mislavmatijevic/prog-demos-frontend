import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { HelpStep } from '../../../types/models';
import { EditorComponent } from '../editor/editor.component';

@Component({
  selector: 'app-new-help-step-definition',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AccordionModule,
    EditorComponent,
    InputTextareaModule,
    ReactiveFormsModule,
  ],
  templateUrl: './new-help-step-definition.component.html',
  styleUrl: './new-help-step-definition.component.scss',
})
export class NewHelpStepDefinitionComponent {
  @Input({ required: true }) helpStep!: HelpStep;

  onHelpCodeChange(newCode: string) {
    this.helpStep.helperCode = newCode;
  }

  onHelpHintChange(newHint: string) {
    this.helpStep.helperText = newHint;
  }
}
