import { Component, Input } from '@angular/core';
import { BasicTask, Subtopic } from '../../../../types/models';

@Component({
  selector: 'app-tasks-in-subtopic',
  standalone: true,
  imports: [],
  templateUrl: './tasks-in-subtopic.component.html',
  styleUrl: './tasks-in-subtopic.component.scss',
})
export class TasksInSubtopicComponent {
  @Input() subtopic!: Subtopic;
  @Input() task!: BasicTask;
}
