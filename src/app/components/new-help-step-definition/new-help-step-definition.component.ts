import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { EditorComponent } from '../editor/editor.component';

@Component({
  selector: 'app-new-help-step-definition',
  standalone: true,
  imports: [
    CommonModule,
    AccordionModule,
    EditorComponent,
    InputTextareaModule,
    ReactiveFormsModule,
  ],
  templateUrl: './new-help-step-definition.component.html',
  styleUrl: './new-help-step-definition.component.scss',
})
export class NewHelpStepDefinitionComponent {
  helpCode = new FormControl('');
  helpHint = new FormControl('');
}
