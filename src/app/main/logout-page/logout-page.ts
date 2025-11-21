import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout-page.html',
})
export class LogoutPage {
  constructor() {
    inject(AuthService).logout();
    inject(Router).navigateByUrl('/login');
    inject(MessageService).add({
      key: 'general',
      severity: 'error',
      detail: 'Sesija je istekla.',
      life: 5000,
    });
  }
}
