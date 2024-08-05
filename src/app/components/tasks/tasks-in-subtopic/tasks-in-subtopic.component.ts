import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BasicTask, Subtopic } from '../../../../types/models';

@Component({
  selector: 'app-tasks-in-subtopic',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './tasks-in-subtopic.component.html',
  styleUrl: './tasks-in-subtopic.component.scss',
})
export class TasksInSubtopicComponent {
  @Input() subtopic!: Subtopic;
  @Input() task!: BasicTask;
  @Output() taskSelected = new EventEmitter<BasicTask>();

  onTaskSelected() {
    this.taskSelected.emit(this.task);
  }
}
