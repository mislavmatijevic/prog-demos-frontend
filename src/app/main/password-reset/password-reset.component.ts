import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { finalize } from 'rxjs';
import { CaptchaComponent } from '../../components/captcha/captcha.component';
import {
  AuthErrorCode,
  AuthFailureResponse,
  AuthService,
} from '../../services/auth.service';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    CaptchaComponent,
    ProgressSpinnerModule,
  ],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss',
})
export class PasswordResetComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  @ViewChild(CaptchaComponent) captchaComponent?: CaptchaComponent;

  resetRequested = false;
  resetToken!: string;
  newPassword = new FormControl('');
  repeatedNewPassword = new FormControl('');
  captchaToken: string | null = null;
  tokenIsOk: boolean = false;

  ngOnInit(): void {
    this.resetToken = this.route.snapshot.paramMap.get('resetToken')!;
  }

  onNewCaptchaToken(newToken: string | null) {
    this.captchaToken = newToken;
    if (!this.tokenIsOk && this.captchaToken !== null) {
      this.checkToken();
    }
  }

  checkToken() {
    this.authService
      .checkPasswordResetToken(this.resetToken, this.captchaToken)
      .subscribe({
        complete: () => {
          this.tokenIsOk = true;
          this.captchaToken = null;
          this.captchaComponent?.forceRefresh();
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.router.navigateByUrl('/login', { replaceUrl: true });
          let errorMessage = '';
          switch ((errorResponse.error as AuthFailureResponse).errorCode) {
            case AuthErrorCode.ERR_CAPTCHA_FAILED:
              errorMessage = 'Sustav je detektirao sumnjivo ponašanje.';
              break;
            case AuthErrorCode.ERR_TOKEN_NOT_VALID:
              errorMessage = 'Zahtjev za obnovom lozinke nije ispravan.';
              break;
            case AuthErrorCode.ERR_TOKEN_NOT_FOUND:
            case AuthErrorCode.ERR_TOKEN_EXPIRED:
              errorMessage = 'Zahtjev za obnovom lozinke je istekao.';
              break;
            default:
              errorMessage =
                'Došlo je do pogreške prilikom provjere validnosti zahtjeva. Pokušaj se prijaviti.';
          }
          this.messageService.add({
            key: 'central',
            severity: 'error',
            detail: errorMessage,
          });
        },
      });
  }

  resetPassword() {
    if (this.captchaToken === null) {
      return;
    }

    if (
      this.newPassword.valid &&
      this.repeatedNewPassword.valid &&
      this.newPassword.value == this.repeatedNewPassword.value
    ) {
      this.resetRequested = true;

      this.authService
        .resetPassword(
          this.newPassword.value!,
          this.resetToken,
          this.captchaToken
        )
        .pipe(
          finalize(() =>
            this.router.navigateByUrl('/login', { replaceUrl: true })
          )
        )
        .subscribe({
          complete: () => {
            this.messageService.add({
              key: 'central',
              severity: 'success',
              detail: 'Nova lozinka uspješno postavljena!',
            });
          },
          error: (errorResponse: HttpErrorResponse) => {
            let errorMessage = '';

            if (errorResponse.status == 403) {
              errorMessage =
                'Zahtjev za novom lozinkom je istekao. Ponovno zatraži promjenu lozinke.';
            } else {
              switch ((errorResponse.error as AuthFailureResponse).errorCode) {
                case AuthErrorCode.ERR_CAPTCHA_FAILED:
                  errorMessage = 'Sustav je detektirao sumnjivo ponašanje.';
                  break;
                default:
                  errorMessage =
                    'Nažalost, nije bilo moguće postaviti novu lozinku zbog pogreške. ' +
                    'Dobio sam mail o ovoj pogreški i prvom prilikom ću pogledati o čemu se radi.';
              }
            }

            this.messageService.add({
              key: 'central',
              severity: 'error',
              detail: errorMessage,
            });
          },
        });
    } else {
      this.messageService.add({
        key: 'general',
        severity: 'error',
        detail: 'Provjeri još jednom unesene podatke.',
      });
    }
  }
}
