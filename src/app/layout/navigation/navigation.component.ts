import { CommonModule } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
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
  constructor(
    private renderer: Renderer2,
    private messageService: MessageService
  ) {}

  isCollapsed: boolean = false;
  sunClickedCounter: number = 0;
  stopClickingSunMessageShown: boolean = false;

  navigationHeaders: Array<NavigationItem> = [
    { name: 'Uči', link: '/demos' },
    { name: 'Vježbaj', link: '/prog' },
  ];

  toggleVisibility() {
    this.isCollapsed = !this.isCollapsed;
  }

  onSunClick(e: MouseEvent) {
    const sunContainer = e.currentTarget as HTMLElement;

    if (this.sunClickedCounter >= 20) {
      if (!this.stopClickingSunMessageShown) {
        sunContainer.style.cursor = 'initial';
        this.messageService.add({
          severity: 'error',
          summary: 'Sve ima svoje granice',
          detail:
            'Ok, dovoljno stiskanja po Suncu, sada se fokusiraj na učenje i rješavanje zadataka!',
          life: 10000,
        });
        this.stopClickingSunMessageShown = true;
      }
      return;
    } else {
      this.sunClickedCounter++;
    }

    const ripple = this.renderer.createElement('div');

    this.renderer.setStyle(ripple, 'position', 'absolute');
    this.renderer.setStyle(ripple, 'top', `${e.clientY - 560}px`);
    this.renderer.setStyle(ripple, 'left', `${e.clientX + 110}px`);
    this.renderer.setStyle(ripple, 'width', '20px');
    this.renderer.setStyle(ripple, 'height', '20px');
    this.renderer.setStyle(ripple, 'background-color', 'darkorange');
    this.renderer.setStyle(ripple, 'border-radius', '50%');
    this.renderer.setStyle(ripple, 'opacity', '1');
    this.renderer.setStyle(
      ripple,
      'transition',
      'all 5s cubic-bezier(0.1, 0.75, 0.05, 0.05)'
    );
    this.renderer.setStyle(ripple, 'z-index', '99');

    this.renderer.appendChild(sunContainer, ripple);

    setTimeout(() => {
      this.renderer.setStyle(ripple, 'opacity', '0');
      this.renderer.setStyle(ripple, 'width', '250px');
      this.renderer.setStyle(ripple, 'height', '250px');
      this.renderer.setStyle(ripple, 'background-color', 'red');
      this.renderer.setStyle(ripple, 'transform', 'translate(-20%, -20%)');
    }, 20);

    setTimeout(() => {
      this.renderer.removeChild(sunContainer, ripple);
    }, 5020);
  }
}
