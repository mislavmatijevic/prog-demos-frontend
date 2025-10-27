import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Event, NavigationStart, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../services/auth.service';

const exemptViews = ['/', '/privacy'];

@Component({
  selector: 'app-report-error',
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
  ],
  templateUrl: './report-error.html',
  styleUrl: './report-error.scss',
})
export class ReportError implements OnInit {
  constructor(private router: Router, private authService: AuthService) {}

  isHidden: boolean = false;
  dialogOpened: boolean = true;
  reportName = new FormControl('');
  reportBody = new FormControl('');
  isLoggedIn = this.authService.isLoggedIn;

  ngOnInit(): void {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.reportName.setValue(`Greška na '${event.url.substring(1)}' ruti`);
        this.reportBody.setValue(
          `Prijavljujem grešku koja se pojavljuje na stranici. Kada otvoriš www.progdemos.com${event.url}, mislim da bi umjesto da se pojavi A trebalo biti B (već štogod)`
        );
        this.isHidden = exemptViews.includes(event.url);
      }
    });
  }

  openReportBugDialog() {
    this.dialogOpened = true;
  }
}
