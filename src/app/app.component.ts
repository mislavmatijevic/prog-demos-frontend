import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { NavigationComponent } from './layout/navigation/navigation.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, ToastModule],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  title = 'prog-demos-frontend';

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.checkIfRefreshTokenExpired();
    }
  }

  private checkIfRefreshTokenExpired() {
    if (this.authService.ensureRefreshTokenStillValid()) {
      this.router.navigateByUrl('/login');
    }
  }
}
