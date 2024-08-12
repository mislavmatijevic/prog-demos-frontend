import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent } from '../../components/login/login.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LoginComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  constructor(private router: Router) {}

  onLoginSuccessful() {
    this.router.navigateByUrl('/');
  }
}
