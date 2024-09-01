import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { InputTextareaModule } from 'primeng/inputtextarea';
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
  @Input({ required: true }) helpCode!: string;
  @Output() helpCodeChange = new EventEmitter<string>();
  @Input({ required: true }) helpHint!: string;
  @Output() helpHintChange = new EventEmitter<string>();

  onHelpCodeChange(newCode: string) {
    this.helpCode = newCode;
    this.helpCodeChange.emit(newCode);
  }

  onHelpHintChange(newHint: string) {
    this.helpHint = newHint;
    this.helpHintChange.emit(newHint);
  }
}
