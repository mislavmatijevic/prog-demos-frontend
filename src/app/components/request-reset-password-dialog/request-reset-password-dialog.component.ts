import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-request-reset-password-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, InputTextModule],
  templateUrl: './request-reset-password-dialog.component.html',
  styleUrl: './request-reset-password-dialog.component.scss',
})
export class RequestResetPasswordDialogComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  hide() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
