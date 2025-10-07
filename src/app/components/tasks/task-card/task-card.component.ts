import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Button } from 'primeng/button';
import { BasicTask } from '../../../../types/models';
import { ComplexityColorPipe } from '../../../pipes/complexity-color.pipe';
import { ComplexityDescriptionPipe } from '../../../pipes/complexity-description.pipe';
import { ComplexityEmojiPipe } from '../../../pipes/complexity-emoji.pipe';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    CommonModule,
    ComplexityEmojiPipe,
    ComplexityDescriptionPipe,
    ComplexityColorPipe,
    Button,
  ],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent implements OnInit {
  @Input({ required: true }) task!: BasicTask;
  @Output() onSelected = new EventEmitter<BasicTask>();

  completed: boolean = false;

  openTask() {
    this.onSelected.emit(this.task);
  }

  ngOnInit(): void {
    this.completed = this.task?.bestSuccessfulSubmission !== undefined;
  }
}
