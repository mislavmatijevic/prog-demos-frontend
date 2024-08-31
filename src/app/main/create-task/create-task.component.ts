import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SliderModule } from 'primeng/slider';
import { Topic } from '../../../types/models';
import { EditorComponent } from '../../components/editor/editor.component';
import {
  NewTaskRequestBody,
  NewTestDefinition,
  TaskService,
} from '../../services/task.service';
import { TopicsService } from '../../services/topics.service';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    InputGroupModule,
    InputTextModule,
    SliderModule,
    CheckboxModule,
    EditorComponent,
    InputTextareaModule,
    DividerModule,
    AccordionModule,
    Button,
  ],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.scss',
})
export class CreateTaskComponent implements OnInit {
  constructor(
    private topicsService: TopicsService,
    private messageService: MessageService,
    private taskService: TaskService
  ) {}
  possibleTopics: Array<Topic> = [];

  selectedTopic = new FormControl<Topic | undefined>(undefined);
  selectedSubtopic = new FormControl<Topic | undefined>(undefined);
  nameControl = new FormControl('');
  complexityControl = new FormControl<number>(1);
  inputControl = new FormControl('');
  outputControl = new FormControl('');
  sha256Control = new FormControl('');
  inputExplanationControl = new FormControl('');
  outputExplanationControl = new FormControl('');
  inputOutputExampleControl = new FormControl('');
  isFinalBoss = new FormControl(false);
  helpCodeStep1 = new FormControl('');
  helpHintStep1 = new FormControl('');
  helpCodeStep2 = new FormControl('');
  helpHintStep2 = new FormControl('');
  helpCodeStep3 = new FormControl('');
  helpHintStep3 = new FormControl('');
  starterCode = new FormControl('');
  solutionCode = new FormControl('');
  codeEditorsVisible = false;

  onSubmit() {
    if (
      this.selectedSubtopic.value != undefined &&
      this.nameControl.valid &&
      this.inputExplanationControl.valid &&
      this.outputExplanationControl.valid &&
      this.complexityControl.value! >= 1 &&
      this.complexityControl.value! <= 5 &&
      (this.inputControl.valid ||
        this.outputControl.valid ||
        this.sha256Control.valid) &&
      this.inputOutputExampleControl.valid &&
      this.starterCode.valid &&
      (this.isFinalBoss.value ||
        (!this.isFinalBoss.value &&
          (this.helpCodeStep1.value?.length! > 10 || this.helpHintStep1.valid)))
    ) {
      const tests: Array<NewTestDefinition> =
        this.fillTestsFromInputAndOutputTextAreas();

      const newTask: NewTaskRequestBody = {
        idSubtopic: this.selectedSubtopic.value.id,
        name: this.nameControl.value!,
        complexity: this.complexityControl.value!.toString(),
        input: this.inputExplanationControl.value!,
        output: this.outputExplanationControl.value!,
        inputOutputExample: this.inputOutputExampleControl.value!,
        isFinalBoss: this.isFinalBoss.value!,
        starterCode: this.starterCode.value!,
        step1Code: this.helpCodeStep1.value || '',
        step2Code: this.helpCodeStep2.value || '',
        step3Code: this.helpCodeStep3.value || '',
        helper1Text: this.helpHintStep1.value || '',
        helper2Text: this.helpHintStep2.value || '',
        helper3Text: this.helpHintStep3.value || '',
        solutionCode: this.solutionCode.value || undefined,
        tests,
      };

      this.taskService.createTask(newTask).subscribe({
        complete: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Novi zadatak stvoren!',
          });
        },
        error: (err: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Nije moguće stvoriti zadatak!',
            detail: `Stvaranje zadatka nije uspjelo. (${err.status})`,
          });
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Nije moguće stvoriti zadatak!',
        detail:
          'Ne čini se da je zadatak u potpunosti definiran, provjeri još jednom sva polja.',
      });
    }
  }

  ngOnInit(): void {
    this.topicsService.getTasksPerTopics().subscribe({
      next: (response) => {
        this.possibleTopics = response.topics;
        if (response.topics.length == 1) {
          this.selectedTopic.setValue(response.topics[0]);
        }
        this.setupTemplateCode();
        this.enableEditors();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          detail: 'Nažalost, dohvat tema nije uspio. Pokušaj ponovno kasnije.',
        });
      },
    });
  }

  enableEditors() {
    this.codeEditorsVisible = true;
  }

  setupTemplateCode() {
    const templateStarterCode =
      '#include<iostream>\n\nusing namespace std;\n\nint main() {\n\n    return 0;\n}\n';
    this.starterCode.setValue(templateStarterCode);
    this.solutionCode.setValue(templateStarterCode);
  }

  fillTestsFromInputAndOutputTextAreas(): NewTestDefinition[] {
    const inputs = this.inputControl.value!.split('\n');
    const outputs = this.outputControl.value!.split('\n');
    const artefactSha256 = this.sha256Control.value!.split('\n');

    const tests: NewTestDefinition[] = [];
    inputs.forEach((input, index) => {
      tests.push({
        input,
        expectedOutput: outputs[index],
        artefactSha256: artefactSha256[index],
      });
    });

    return tests;
  }

  getCurrentComplexityInEmojis(): string {
    switch (this.complexityControl.value) {
      case 1:
        return '😎';
      case 2:
        return '🧐';
      case 3:
        return '😬';
      case 4:
        return '😵‍💫';
      case 5:
        return '🫠';
      default:
        return '';
    }
  }
}
