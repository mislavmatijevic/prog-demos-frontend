import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

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

  resetRequested = false;
  resetToken!: string;
  newPassword = new FormControl('');
  repeatedNewPassword = new FormControl('');

  ngOnInit(): void {
    this.resetToken = this.route.snapshot.paramMap.get('resetToken')!;
  }

  resetPassword() {
    if (
      this.newPassword.valid &&
      this.repeatedNewPassword.valid &&
      this.newPassword.value == this.repeatedNewPassword.value
    ) {
      this.resetRequested = true;

      this.authService
        .resetPassword(this.newPassword.value!, this.resetToken)
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
          error: (err) => {
            let errorMessage = '';

            if (
              err instanceof HttpErrorResponse &&
              err.status == 403 &&
              (err.error.message as string).includes('expired')
            ) {
              errorMessage = 'Zahtjev za novom lozinkom je istekao.';
            } else {
              errorMessage =
                'Nažalost, nije bilo moguće postaviti novu lozinku!';
            }

            this.messageService.add({
              key: 'central',
              severity: 'error',
              detail: errorMessage + ' Ponovno zatraži promjenu lozinke.',
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
