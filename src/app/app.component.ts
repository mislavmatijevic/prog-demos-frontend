import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ReportIssue } from './components/report-issue/report-issue';
import { NavigationComponent } from './layout/navigation/navigation.component';
import { PreloaderService } from './preloader.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, ToastModule, ReportIssue],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private preloaderService: PreloaderService
  ) {}

  title = 'prog-demos-frontend';

  ngOnInit(): void {
    this.preloaderService.hide();
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
