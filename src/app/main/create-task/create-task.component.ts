import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { standardCppStarterCode } from '../../../helpers/editor-helpers';
import { HelpStep, Subtopic, Topic } from '../../../types/models';
import { NewHelpStepDefinitionComponent } from '../../components/new-help-step-definition/new-help-step-definition.component';
import { ComplexityEmojiPipe } from '../../pipes/complexity-emoji.pipe';
import {
  NewTaskRequestBody,
  NewTestDefinition,
  TaskService,
} from '../../services/task.service';
import { TopicsService } from '../../services/topics.service';

const SELECTED_SUBTOPIC_STORAGE_KEY =
  'taskCreationInProgress-selectedTopicId_SubtopicId';
const NAME_CONTROL_STORAGE_KEY = 'taskCreationInProgress-name';
const COMPLEXITY_CONTROL_STORAGE_KEY = 'taskCreationInProgress-complexity';
const INPUT_CONTROL_STORAGE_KEY = 'taskCreationInProgress-input';
const OUTPUT_CONTROL_STORAGE_KEY = 'taskCreationInProgress-output';
const SHA256_CONTROL_STORAGE_KEY = 'taskCreationInProgress-sha256';
const INPUT_EXPLANATION_CONTROL_STORAGE_KEY =
  'taskCreationInProgress-inputExplanation';
const OUTPUT_EXPLANATION_CONTROL_STORAGE_KEY =
  'taskCreationInProgress-outputExplanation';
const INPUT_OUTPUT_EXAMPLE_CONTROL_STORAGE_KEY =
  'taskCreationInProgress-inputOutputExample';
const IS_BOSS_BATTLE_STORAGE_KEY = 'taskCreationInProgress-isBossBattle';
const HELP_STEPS_STORAGE_KEY = 'taskCreationInProgress-isBossBattle';

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
    InputTextareaModule,
    DividerModule,
    AccordionModule,
    Button,
    NewHelpStepDefinitionComponent,
    ComplexityEmojiPipe,
  ],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.scss',
})
export class CreateTaskComponent implements OnInit, OnDestroy {
  constructor(
    private topicsService: TopicsService,
    private messageService: MessageService,
    private taskService: TaskService
  ) {}
  possibleTopics: Array<Topic> = [];

  selectedTopic = new FormControl<Topic | undefined>(undefined);
  selectedSubtopic = new FormControl<Subtopic | undefined>(undefined);
  nameControl = new FormControl('');
  complexityControl = new FormControl<number>(1);
  inputControl = new FormControl('');
  outputControl = new FormControl('');
  sha256Control = new FormControl('');
  inputExplanationControl = new FormControl('');
  outputExplanationControl = new FormControl('');
  inputOutputExampleControl = new FormControl('');
  isBossBattle = new FormControl(false);

  codeEditorsVisible = false;
  definedHelpSteps: Array<HelpStep> = [];

  ngOnInit(): void {
    this.topicsService.getTasksPerTopics().subscribe({
      next: (response) => {
        this.possibleTopics = response.topics;
        if (response.topics.length == 1) {
          this.selectedTopic.setValue(response.topics[0]);
        }
        this.enableEditors();
        this.addHelpStep();
        this.loadLatestSavedState();
        this.enableAutosaveOnExit();
      },
      error: () => {
        this.messageService.add({
          key: 'central',
          severity: 'error',
          detail: 'Nažalost, dohvat tema nije uspio. Pokušaj ponovno kasnije.',
        });
      },
    });
  }

  ngOnDestroy(): void {
    if (this.nameControl.value && this.nameControl.value.length > 0) {
      this.saveCurrentState();
    } else {
      this.clearSavedState();
    }
  }

  loadLatestSavedState() {
    this.nameControl.setValue(localStorage.getItem(NAME_CONTROL_STORAGE_KEY));

    const topicSubtopicIds = localStorage.getItem(
      SELECTED_SUBTOPIC_STORAGE_KEY
    );
    if (topicSubtopicIds === null) {
      return;
    }

    const lastTopicId = topicSubtopicIds.split('_')[0];
    const lastSubtopicId = topicSubtopicIds.split('_')[1];

    const recoveredTopic = this.possibleTopics.find(
      (topic) => topic.id == parseInt(lastTopicId)
    );
    this.selectedTopic.setValue(recoveredTopic);

    const recoveredSubtopic = recoveredTopic?.subtopics.find(
      (subtopic) => subtopic.id === parseInt(lastSubtopicId)
    );
    this.selectedSubtopic.setValue(recoveredSubtopic);

    this.complexityControl.setValue(
      parseInt(localStorage.getItem(COMPLEXITY_CONTROL_STORAGE_KEY) ?? '1')
    );
    this.inputControl.setValue(localStorage.getItem(INPUT_CONTROL_STORAGE_KEY));
    this.outputControl.setValue(
      localStorage.getItem(OUTPUT_CONTROL_STORAGE_KEY)
    );
    this.sha256Control.setValue(
      localStorage.getItem(SHA256_CONTROL_STORAGE_KEY)
    );
    this.inputExplanationControl.setValue(
      localStorage.getItem(INPUT_EXPLANATION_CONTROL_STORAGE_KEY)
    );
    this.outputExplanationControl.setValue(
      localStorage.getItem(OUTPUT_EXPLANATION_CONTROL_STORAGE_KEY)
    );
    this.inputOutputExampleControl.setValue(
      localStorage.getItem(INPUT_OUTPUT_EXAMPLE_CONTROL_STORAGE_KEY)
    );
    this.isBossBattle.setValue(
      localStorage.getItem(IS_BOSS_BATTLE_STORAGE_KEY) == 'true'
    );

    const helpSteps: any = JSON.parse(
      localStorage.getItem(HELP_STEPS_STORAGE_KEY)!
    );
    if (helpSteps instanceof Array && helpSteps.length > 0) {
      this.definedHelpSteps = helpSteps;
    }
  }

  enableAutosaveOnExit() {
    const saveStateCallback = () => this.saveCurrentState();
    window.addEventListener('beforeunload', () => saveStateCallback());
  }

  saveCurrentState() {
    localStorage.setItem(
      NAME_CONTROL_STORAGE_KEY,
      this.nameControl.value ?? ''
    );

    if (
      this.selectedTopic.value &&
      this.selectedTopic.value.id > 0 &&
      this.selectedSubtopic.value &&
      this.selectedSubtopic.value.id > 0
    ) {
      localStorage.setItem(
        SELECTED_SUBTOPIC_STORAGE_KEY,
        `${this.selectedTopic.value.id}_${this.selectedSubtopic.value.id}`
      );
    }

    localStorage.setItem(
      COMPLEXITY_CONTROL_STORAGE_KEY,
      this.complexityControl.value?.toString() ?? '1'
    );
    localStorage.setItem(
      INPUT_CONTROL_STORAGE_KEY,
      this.inputControl.value ?? ''
    );
    localStorage.setItem(
      OUTPUT_CONTROL_STORAGE_KEY,
      this.outputControl.value ?? ''
    );
    localStorage.setItem(
      SHA256_CONTROL_STORAGE_KEY,
      this.sha256Control.value ?? ''
    );
    localStorage.setItem(
      INPUT_EXPLANATION_CONTROL_STORAGE_KEY,
      this.inputExplanationControl.value ?? ''
    );
    localStorage.setItem(
      OUTPUT_EXPLANATION_CONTROL_STORAGE_KEY,
      this.outputExplanationControl.value ?? ''
    );
    localStorage.setItem(
      INPUT_OUTPUT_EXAMPLE_CONTROL_STORAGE_KEY,
      this.inputOutputExampleControl.value ?? ''
    );
    localStorage.setItem(
      IS_BOSS_BATTLE_STORAGE_KEY,
      this.isBossBattle.value ? 'true' : 'false'
    );

    localStorage.setItem(
      HELP_STEPS_STORAGE_KEY,
      JSON.stringify(this.definedHelpSteps)
    );
  }

  clearSavedState() {
    localStorage.removeItem(SELECTED_SUBTOPIC_STORAGE_KEY);
    localStorage.removeItem(NAME_CONTROL_STORAGE_KEY);
    localStorage.removeItem(COMPLEXITY_CONTROL_STORAGE_KEY);
    localStorage.removeItem(INPUT_CONTROL_STORAGE_KEY);
    localStorage.removeItem(OUTPUT_CONTROL_STORAGE_KEY);
    localStorage.removeItem(SHA256_CONTROL_STORAGE_KEY);
    localStorage.removeItem(INPUT_EXPLANATION_CONTROL_STORAGE_KEY);
    localStorage.removeItem(OUTPUT_EXPLANATION_CONTROL_STORAGE_KEY);
    localStorage.removeItem(INPUT_OUTPUT_EXAMPLE_CONTROL_STORAGE_KEY);
    localStorage.removeItem(IS_BOSS_BATTLE_STORAGE_KEY);
    localStorage.removeItem(HELP_STEPS_STORAGE_KEY);
  }

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
      (this.isBossBattle.value || !this.isBossBattle.value)
    ) {
      const tests: Array<NewTestDefinition> =
        this.fillTestsFromInputAndOutputTextAreas();

      const helpSteps: Array<HelpStep> = this.definedHelpSteps;

      const newTask: NewTaskRequestBody = {
        idSubtopic: this.selectedSubtopic.value.id,
        name: this.nameControl.value!,
        complexity: this.complexityControl.value!.toString(),
        input: this.inputExplanationControl.value!,
        output: this.outputExplanationControl.value!,
        inputOutputExample: this.inputOutputExampleControl.value!,
        isBossBattle: this.isBossBattle.value!,
        tests,
        helpSteps,
      };

      this.taskService.createTask(newTask).subscribe({
        complete: () => {
          this.messageService.add({
            key: 'general',
            severity: 'success',
            summary: 'Novi zadatak stvoren!',
          });
        },
        error: (err: HttpErrorResponse) => {
          this.messageService.add({
            key: 'general',
            severity: 'error',
            summary: 'Nije moguće stvoriti zadatak!',
            detail: `Stvaranje zadatka nije uspjelo. (${err.status}): ${
              err.error?.message ?? JSON.stringify(err.error)
            }`,
          });
        },
      });
    } else {
      this.messageService.add({
        key: 'general',
        severity: 'error',
        summary: 'Nije moguće stvoriti zadatak!',
        detail:
          'Ne čini se da je zadatak u potpunosti definiran, provjeri još jednom sva polja.',
      });
    }
  }

  enableEditors() {
    this.codeEditorsVisible = true;
  }

  fillTestsFromInputAndOutputTextAreas(): NewTestDefinition[] {
    const inputs = this.inputControl.value!.split('\n');
    const outputs = this.outputControl.value!.split('\n');
    const artefactsSha256 = this.sha256Control.value!.split('\n');

    const tests: NewTestDefinition[] = [];
    inputs.forEach((input, index) => {
      const inputLines = input.replaceAll('\\n', '\n');
      const outputLines = outputs[index].replaceAll('\\n', '\n');
      const artefactSha256 = artefactsSha256[index];
      tests.push({
        input: inputLines,
        expectedOutput: outputLines,
        artefactSha256,
      });
    });

    return tests;
  }

  addHelpStep() {
    if (this.definedHelpSteps.length < 10) {
      this.definedHelpSteps.push({
        step: this.definedHelpSteps.length + 1,
        helperCode: standardCppStarterCode,
        helperText: '',
      });
    } else {
      this.messageService.add({
        key: 'central',
        severity: 'error',
        summary: 'Ne mogu dodati više pomoći na zadatak!',
      });
    }
  }

  removeHelpStep() {
    this.definedHelpSteps.splice(this.definedHelpSteps.length - 1, 1);
  }
}
