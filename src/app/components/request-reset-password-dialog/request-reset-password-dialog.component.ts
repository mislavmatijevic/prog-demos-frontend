import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-request-reset-password-dialog',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './request-reset-password-dialog.component.html',
  styleUrl: './request-reset-password-dialog.component.scss',
})
export class RequestResetPasswordDialogComponent {
  constructor(
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  email = new FormControl('');

  hide() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  requestPasswordReset() {
    if (this.email.valid) {
      this.authService.requestPasswordReset(this.email.value!).subscribe({
        complete: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Zahtjev je poslan!',
            detail:
              'Uskoro ćeš dobiti mail s uputama kako promijeniti lozinku za svoj račun.',
            life: 20000,
          });
          this.hide();
        },
        error: (errRes: HttpErrorResponse) => {
          let errorMessage: string;
          switch (errRes.status) {
            case 425:
              errorMessage =
                'Već ti je nedavno poslan zahtjev za novom lozinkom. Ako nije stigao, pričekaj još malo prije ponovnog pokušaja!';
              break;
            default:
              errorMessage =
                'Provjeri još jednom da tvoj postojeći račun sigurno koristi uneseni email.';
              break;
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Zahtjev za novom lozinkom nije uspio.',
            detail: errorMessage,
          });
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        detail: 'Hm, ne čini se da je to ispravan email...',
      });
    }
  }
}
