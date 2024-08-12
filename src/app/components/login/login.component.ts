import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    DividerModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ReactiveFormsModule,
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

  identifier = new FormControl('');
  password = new FormControl('');

  onSubmit() {
    if (this.identifier.valid && this.password.valid) {
      this.authService
        .login(this.identifier.value!, this.password.value!)
        .subscribe({
          complete: () => {
            this.messageService.add({
              severity: 'success',
              detail: `Pozdrav, ${this.authService.getUsername()}!`,
            });
            this.loginSuccessful.emit();
          },
          error: () => {
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
}
