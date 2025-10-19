import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {
  AuthErrorCode,
  AuthFailureResponse,
  AuthService,
} from '../../services/auth.service';
import { CaptchaComponent } from '../captcha/captcha.component';
import { RequestResetPasswordDialogComponent } from '../request-reset-password-dialog/request-reset-password-dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    DividerModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ReactiveFormsModule,
    ProgressSpinnerModule,
    RequestResetPasswordDialogComponent,
    CaptchaComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  @Output() loginSuccessful = new EventEmitter();

  requestPasswordResetDialogVisible = false;
  loginInProgress: boolean = false;

  identifier = new FormControl('');
  password = new FormControl('');

  captchaToken: string | null = null;

  onSubmit() {
    if (!this.identifier.valid || !this.password.valid) {
      this.messageService.add({
        key: 'general',
        severity: 'info',
        detail: 'Unesi ispravne korisničke podatke.',
      });
      return;
    }

    if (this.captchaToken === null) {
      return;
    }

    this.loginInProgress = true;

    this.authService
      .login(this.identifier.value!, this.password.value!, this.captchaToken)
      .subscribe({
        complete: () => {
          this.loginInProgress = false;
          this.messageService.add({
            key: 'general',
            severity: 'success',
            detail: `Pozdrav, ${this.authService.getUser()!.username}!`,
          });
          this.loginSuccessful.emit();
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.loginInProgress = false;

          let message =
            'Provjeri još jednom svoje podatke ili pokušaj ponovno kasnije!';

          if (errorResponse.status >= 400 && errorResponse.status <= 400) {
            switch ((errorResponse.error as AuthFailureResponse).errorCode) {
              case AuthErrorCode.EXEC_ERR_CAPTCHA_FAILED:
                // TODO implement challange
                message =
                  'Sustav je detektirao sumnjivo ponašanje, pokušaj ponovno kasnije.';
                break;
            }
          }

          this.messageService.add({
            key: 'general',
            severity: 'error',
            summary: 'Prijava nije uspjela!',
            detail: message,
          });
        },
      });
  }
  openResetPasswordDialog(event: Event) {
    event.preventDefault();
    this.requestPasswordResetDialogVisible = true;
  }
}
