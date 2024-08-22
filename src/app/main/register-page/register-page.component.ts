import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RegisterComponent } from '../../components/register/register.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, RegisterComponent],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
})
export class RegisterPageComponent {
  registrationSucceeded = false;

  handlePostRegistration() {
    this.registrationSucceeded = true;
  }
}
