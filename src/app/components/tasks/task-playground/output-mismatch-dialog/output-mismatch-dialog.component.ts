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
import { ExecutionFailureReasonOutputMismatch } from '../../../../services/task.service';
import { EditorComponent } from '../../../editor/editor.component';

@Component({
  selector: 'app-output-mismatch-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, EditorComponent],
  templateUrl: './output-mismatch-dialog.component.html',
  styleUrl: './output-mismatch-dialog.component.scss',
})
export class OutputMismatchDialogComponent implements OnChanges {
  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  @Input({ required: true })
  reportedFailure!: ExecutionFailureReasonOutputMismatch;
  @Input({ required: true })
  visible: boolean = false;
  @Output()
  visibleChange = new EventEmitter<boolean>();

  diffEditorShown = false;
  resizeEvent: UIEvent = new UIEvent('init');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reportedFailure']) {
      this.diffEditorShown = this.reportedFailure.expectedOutput !== undefined;
    }
  }

  handleOnHide() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  handleResize(event: MouseEvent) {
    this.resizeEvent = event;
    this.changeDetectorRef.detectChanges();
  }
}
