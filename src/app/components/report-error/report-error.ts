import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Event, NavigationStart, Router } from '@angular/router';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

const exemptViews = ['/', '/privacy'];

@Component({
  selector: 'app-report-error',
  standalone: true,
  imports: [CommonModule, Button, TooltipModule],
  templateUrl: './report-error.html',
  styleUrl: './report-error.scss',
})
export class ReportError implements OnInit {
  constructor(private router: Router) {}

  protected isHidden: boolean = false;

  ngOnInit(): void {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.isHidden = exemptViews.includes(event.url);
      }
    });
  }

  openReportBugDialog() {
    throw new Error('Method not implemented.');
  }
}
