import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-activation',
  standalone: true,
  imports: [CommonModule, RouterModule, ProgressSpinnerModule],
  templateUrl: './activation.component.html',
  styleUrl: './activation.component.scss',
})
export class ActivationComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  isActivationCompleted: boolean = false;
  isActivationSuccessful: boolean = false;
  activatedUsername: string | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const key = params['activationToken'] as string;

      if (key == undefined || key.length != 128) {
        this.router.navigateByUrl('/');
        return;
      }

      this.authService.activate(key).subscribe({
        next: ({ username }) => {
          this.activatedUsername = username;
        },
        complete: () => {
          this.isActivationCompleted = this.isActivationSuccessful = true;
          this.messageService.add({
            severity: 'success',
            detail: 'Aktivacija uspješna!',
          });
        },
        error: () => {
          this.isActivationCompleted = true;
          this.isActivationSuccessful = false;
          this.messageService.add({
            severity: 'error',
            detail: 'Aktivacija neuspješna.',
          });
        },
      });
    });
  }
}
