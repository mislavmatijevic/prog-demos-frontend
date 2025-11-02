import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Event, NavigationStart, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CaptchaComponent } from '../captcha/captcha.component';

const exemptViews = ['/', '/privacy'];

type ReportIssueResponse = {
  success: boolean;
  newIssueUrl: string;
};

@Component({
  selector: 'app-report-issue',
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
    DialogModule,
    CheckboxModule,
    CaptchaComponent,
  ],
  templateUrl: './report-issue.html',
  styleUrl: './report-issue.scss',
})
export class ReportIssue implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService,
    private apiService: ApiService
  ) {}

  isHidden: boolean = false;
  dialogOpened: boolean = false;
  reportName = new FormControl('');
  reportBody = new FormControl('');
  shouldIncludeName = new FormControl(false);
  creatingGithubIssue: boolean = false;
  isLoggedIn = this.authService.isLoggedIn;
  urlToCreatedIssue?: string;
  captchaToken: string | null = null;

  ngOnInit(): void {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.reportName.setValue(`Greška na '${event.url.substring(1)}' ruti`);
        this.reportBody.setValue(
          `Prijavljujem grešku koja se pojavljuje na stranici. Kada otvoriš www.progdemos.com${event.url}, mislim da bi umjesto da se pojavi A trebalo biti B...`
        );
        this.isHidden = exemptViews.includes(event.url);
      }
    });
  }

  openReportBugDialog() {
    this.dialogOpened = true;
    this.urlToCreatedIssue = undefined;
  }

  onGitHubIssueSubmit() {
    if (this.captchaToken == null) {
      return;
    }

    if (!this.reportName.valid || !this.reportBody.valid) {
      this.messageService.add({
        key: 'central',
        severity: 'error',
        detail: 'Dodaj kratki opis, a potom detaljni s barem 100 slova.',
      });
      return;
    }

    this.creatingGithubIssue = true;

    this.apiService
      .post<ReportIssueResponse>(
        '/report-issue',
        {
          title: this.reportName.value,
          description: this.reportBody.value,
          includeUsername: this.shouldIncludeName.value,
          captchaToken: this.captchaToken,
        },
        this.shouldIncludeName.value ?? false
      )
      .subscribe({
        next: (value) => {
          this.creatingGithubIssue = false;
          if (value.success) {
            this.urlToCreatedIssue = value.newIssueUrl;
          } else {
            this.notifyError();
          }
        },
        error: () => {
          this.creatingGithubIssue = false;
          this.notifyError();
        },
      });
  }

  notifyError() {
    this.messageService.add({
      key: 'central',
      severity: 'error',
      detail:
        'Nažalost, podnošenje prijave za grešku nije uspjelo. Pokušaj ručno na GitHubu ili se javi direktno na mail.',
    });
  }
}
