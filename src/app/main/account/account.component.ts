import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent {
  authService: AuthService;
  constructor(authService: AuthService, private router: Router) {
    this.authService = authService;
  }

  signOut() {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}
