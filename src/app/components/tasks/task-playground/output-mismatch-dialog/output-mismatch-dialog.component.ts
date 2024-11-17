import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ExecutionFailureReasonOutputMismatch } from '../../../../services/task.service';
import { EditorComponent } from '../../../editor/editor.component';

@Component({
  selector: 'app-output-mismatch-dialog',
  standalone: true,
  imports: [DialogModule, EditorComponent],
  templateUrl: './output-mismatch-dialog.component.html',
  styleUrl: './output-mismatch-dialog.component.scss',
})
export class OutputMismatchDialogComponent {
  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  @Input({ required: true })
  reportedFailure!: ExecutionFailureReasonOutputMismatch;
  @Input({ required: true })
  visible: boolean = false;
  @Output()
  visibleChange = new EventEmitter<boolean>();

  resizeEvent: UIEvent = new UIEvent('init');

  handleOnHide() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  handleResize(event: MouseEvent) {
    this.resizeEvent = event;
    this.changeDetectorRef.detectChanges();
  }
}
