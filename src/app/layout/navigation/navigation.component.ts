import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigationItem } from '../../../types/general';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {
  navigationHeaders: Array<NavigationItem> = [
    { name: 'Uči', link: '/demos' },
    { name: 'Vježbaj', link: '/prog' },
  ];
}
