import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationItem } from '../../../types/general';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {
  navigationHeaders: Array<NavigationItem> = [
    { name: 'Uči' },
    { name: 'Vježbaj' },
  ];
}
