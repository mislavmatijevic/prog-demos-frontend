import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import {
  AuthService,
  RegistrationErrorCode,
  RegistrationFailureResponse,
} from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    DividerModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  constructor(
    private authService: AuthService,
    private messageService: MessageService
  ) {}
  @Output() registrationSuccessful = new EventEmitter();

  email = new FormControl('');
  username = new FormControl('');
  password = new FormControl('');

  onSubmit() {
    if (this.email.valid && this.username.valid && this.password.valid) {
      this.authService
        .register(this.username.value!, this.email.value!, this.password.value!)
        .subscribe({
          complete: () => {
            this.messageService.add({
              severity: 'success',
              detail: 'Registracija je uspjela!',
            });
            this.registrationSuccessful.emit(true);
          },
          error: (errorResponse: HttpErrorResponse) => {
            let message =
              'Nažalost, registracija nije uspjela. Molim te, pokušaj malo kasnije.';

            if (errorResponse.status !== 0) {
              console.log(errorResponse.status);
              console.log(errorResponse.error);

              switch (
                (errorResponse.error as RegistrationFailureResponse).errorCode
              ) {
                case RegistrationErrorCode.INFO_INVALID:
                  message = 'Provjeri svoje podatke još jednom.';
                  break;
                case RegistrationErrorCode.USERNAME_OR_EMAIL_TAKEN:
                  message =
                    'Čini se da već postoji korisnik s ovim korisničkim imenom ili unesenim emailom.';
                  break;
              }
            }

            this.messageService.add({
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
        severity: 'error',
        summary: 'Provjeri još jednom podatke za registraciju!',
        detail: errorMessage,
      });
    }
  }
}
