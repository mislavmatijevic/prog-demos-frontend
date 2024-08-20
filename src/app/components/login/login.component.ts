import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../services/auth.service';
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
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(
    private authService: AuthService,
    private messageService: MessageService
  ) {}
  loginInProgress: boolean = false;
  @Output() loginSuccessful = new EventEmitter();

  identifier = new FormControl('');
  password = new FormControl('');

  requestPasswordResetDialogVisible = false;

  onSubmit() {
    if (this.identifier.valid && this.password.valid) {
      this.loginInProgress = true;

      this.authService
        .login(this.identifier.value!, this.password.value!)
        .subscribe({
          complete: () => {
            this.loginInProgress = false;
            this.messageService.add({
              severity: 'success',
              detail: `Pozdrav, ${this.authService.getUsername()}!`,
            });
            this.loginSuccessful.emit();
          },
          error: () => {
            this.loginInProgress = false;

            this.messageService.add({
              severity: 'error',
              summary: 'Prijava nije uspjela!',
              detail:
                'Provjeri još jednom svoje podatke ili pokušaj ponovno kasnije!',
            });
          },
        });
    } else {
      this.messageService.add({
        severity: 'info',
        detail: 'Unesi ispravne korisničke podatke.',
      });
    }
  }
  openResetPasswordDialog(event: Event) {
    event.preventDefault();
    this.requestPasswordResetDialogVisible = true;
  }
}
