import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { NavigationItem } from '../../../types/general';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, Button],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {
  isCollapsed: boolean = false;

  navigationHeaders: Array<NavigationItem> = [
    { name: 'Uči', link: '/demos' },
    { name: 'Vježbaj', link: '/prog' },
  ];

  toggleVisibility() {
    this.isCollapsed = !this.isCollapsed;
  }
}
