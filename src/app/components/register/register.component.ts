import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import {
  AuthErrorCode,
  AuthFailureResponse,
  AuthService,
} from '../../services/auth.service';
import { CaptchaComponent } from '../captcha/captcha.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    DividerModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    ProgressSpinnerModule,
    CaptchaComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  constructor(
    private authService: AuthService,
    private messageService: MessageService
  ) {}
  registrationInProgress: boolean = false;
  @Output() registrationSuccessful = new EventEmitter();

  email = new FormControl('');
  username = new FormControl('');
  password = new FormControl('');
  checkedPrivacyPolicy: boolean = false;

  captchaToken: string | null = null;

  onSubmit() {
    if (!this.captchaToken || !this.checkedPrivacyPolicy) {
      return;
    }

    if (this.email.valid && this.username.valid && this.password.valid) {
      this.registrationInProgress = true;

      this.authService
        .register(
          this.username.value!,
          this.email.value!,
          this.password.value!,
          this.captchaToken
        )
        .subscribe({
          complete: () => {
            this.registrationInProgress = false;
            this.messageService.add({
              key: 'central',
              severity: 'info',
              summary: 'Poslan ti je mail za dovršetak registracije!',
              detail:
                'Ako ti uskoro ne dođe obavijest, provjeri neželjenu poštu (spam).',
              life: 60000,
            });
            this.registrationSuccessful.emit(true);
          },
          error: (errorResponse: HttpErrorResponse) => {
            this.registrationInProgress = false;

            let message =
              'Nažalost, registracija nije uspjela. Molim te, pokušaj malo kasnije.';

            if (errorResponse.status >= 400 && errorResponse.status <= 400) {
              switch ((errorResponse.error as AuthFailureResponse).errorCode) {
                case AuthErrorCode.INFO_INVALID:
                  message = 'Provjeri svoje podatke još jednom.';
                  break;
                case AuthErrorCode.USERNAME_OR_EMAIL_TAKEN:
                  message =
                    'Čini se da već postoji korisnik s ovim korisničkim imenom ili unesenim emailom.';
                  break;
                case AuthErrorCode.EXEC_ERR_CAPTCHA_FAILED:
                  message =
                    'Sustav je detektirao sumnjivo ponašanje, pokušaj ponovno kasnije.';
                  break;
              }
            }

            this.messageService.add({
              key: 'general',
              severity: 'error',
              summary: 'Registracija nije uspjela!',
              detail: message,
              life: 10000,
            });
          },
        });
    } else {
      let errorMessage = '';

      if (!this.username.valid) {
        errorMessage = 'Tvoje korisničko ime ne čini se ispravno.';
      } else if (!this.email.valid) {
        errorMessage = 'Ne čini se da je uneseni email u ispravnom formatu!';
      } else if (!this.password.valid) {
        errorMessage = 'Lozinka mora biti duža.';
      }
      this.messageService.add({
        key: 'general',
        severity: 'error',
        summary: 'Provjeri još jednom podatke za registraciju!',
        detail: errorMessage,
        life: 5000,
      });
    }
  }
}
