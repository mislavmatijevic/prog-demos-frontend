import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProgDemosHeadPipe } from '../../../../pipes/prog-demos-head.pipe';

@Component({
  selector: 'app-success-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, InputTextModule, ProgDemosHeadPipe],
  templateUrl: './success-dialog.component.html',
  styleUrl: './success-dialog.component.scss',
})
export class SuccessDialogComponent {
  @Input({ required: true }) scoreNumber: number = 0;
  @Input() visible = true;
  @Output() visibleChange = new EventEmitter<boolean>();

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
