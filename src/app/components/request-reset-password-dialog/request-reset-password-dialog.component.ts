import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha-2';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import {
  AuthErrorCode,
  AuthFailureResponse,
  AuthService,
} from '../../services/auth.service';

@Component({
  selector: 'app-request-reset-password-dialog',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    RecaptchaV3Module,
  ],
  templateUrl: './request-reset-password-dialog.component.html',
  styleUrl: './request-reset-password-dialog.component.scss',
})
export class RequestResetPasswordDialogComponent {
  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private recaptchaV3Service: ReCaptchaV3Service
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
      this.recaptchaV3Service
        .execute('request_password_reset')
        .subscribe((recaptchaToken) => {
          this.authService
            .requestPasswordReset(this.email.value!, recaptchaToken)
            .subscribe({
              complete: () => {
                this.messageService.add({
                  key: 'central',
                  severity: 'success',
                  summary: 'Zahtjev je poslan!',
                  detail:
                    'Uskoro ćeš dobiti mail s uputama kako promijeniti lozinku za svoj račun.',
                  life: 20000,
                });
                this.hide();
              },
              error: (errorResponse: HttpErrorResponse) => {
                let errorMessage: string =
                  'Nažalost, došlo je do pogreške. Ponovni proces malo kasnije.';

                if (
                  errorResponse.status >= 400 &&
                  errorResponse.status <= 400
                ) {
                  switch (
                    (errorResponse.error as AuthFailureResponse).errorCode
                  ) {
                    case AuthErrorCode.EXEC_ERR_RECAPTCHA_REQUIRES_CHALLENGE:
                      // TODO implement challange
                      errorMessage =
                        'Sustav je detektirao sumnjivo ponašanje, pokušaj ponovno kasnije.';
                      break;
                  }
                }

                switch (errorResponse.status) {
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
                  key: 'general',
                  severity: 'error',
                  summary: 'Zahtjev za novom lozinkom nije uspio.',
                  detail: errorMessage,
                });
              },
            });
        });
    } else {
      this.messageService.add({
        key: 'general',
        severity: 'error',
        detail: 'Hm, ne čini se da je to ispravan email...',
      });
    }
  }
}
