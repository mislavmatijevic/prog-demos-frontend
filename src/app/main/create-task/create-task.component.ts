import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SliderModule } from 'primeng/slider';
import { Topic } from '../../../types/models';
import { EditorComponent } from '../../components/editor/editor.component';
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
  ],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.scss',
})
export class CreateTaskComponent implements OnInit {
  constructor(
    private topicsService: TopicsService,
    private messageService: MessageService
  ) {}
  possibleTopics: Array<Topic> = [];

  selectedTopic = new FormControl<Topic | undefined>(undefined);
  selectedSubtopic = new FormControl<Topic | undefined>(undefined);
  nameControl = new FormControl('');
  complexity = new FormControl<number>(50);
  inputControl = new FormControl('');
  outputControl = new FormControl('');
  inputOutputExampleControl = new FormControl('');
  isFinalBoss = new FormControl<boolean>(false);
  helpCodeStep1 = new FormControl('');
  helpHintStep1 = new FormControl('');
  helpCodeStep2 = new FormControl('');
  helpHintStep2 = new FormControl('');
  helpCodeStep3 = new FormControl('');
  helpHintStep3 = new FormControl('');
  starterCode = new FormControl('');
  codeEditorsVisible = false;

  shouldHideHelpInputs = false;

  onSubmit() {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.topicsService.getTasksPerTopics().subscribe({
      next: (response) => {
        this.possibleTopics = response.topics;
        if (response.topics.length == 1) {
          this.selectedTopic.setValue(response.topics[0]);
        }
        this.setupEventHandlers();
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
    this.helpCodeStep1.setValue(templateStarterCode);
    this.helpCodeStep2.setValue(templateStarterCode);
    this.helpCodeStep3.setValue(templateStarterCode);
  }

  setupEventHandlers() {
    this.isFinalBoss.registerOnChange(() => {
      this.shouldHideHelpInputs = (this.isFinalBoss.value as any)![0]!;
    });
  }
}
