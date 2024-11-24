import { CommonModule } from '@angular/common';
import { Component, effect, Renderer2 } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { sizes } from '../../../styles/variables';
import { NavigationItem } from '../../../types/general';
import { AuthService } from '../../services/auth.service';

enum RippleEffectPositionalInfo {
  NORMAL,
  SMALL_WIDTH,
  SMALL_HEIGHT,
  SMALL_WIDTH_HEIGHT,
}

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
    private messageService: MessageService,
    private authService: AuthService
  ) {
    effect(() => {
      this.navigationHeaders = [
        { name: 'Uči', link: '/demos', icon: 'pi-play-circle' },
        { name: 'Vježbaj', link: '/prog', icon: 'pi-objects-column' },
      ];
      this.displayAppropriateNavigations();
    });
  }

  isCollapsed: boolean = false;
  sunClickedCounter: number = 0;
  stopClickingSunMessageShown: boolean = false;

  navigationHeaders!: Array<NavigationItem>;

  toggleVisibility() {
    this.isCollapsed = !this.isCollapsed;
  }

  onSunClick(e: MouseEvent) {
    let rippleEfectPosition = RippleEffectPositionalInfo.NORMAL;
    if (
      window.innerWidth <= sizes.smallWidth &&
      window.innerHeight <= sizes.smallHeight
    ) {
      rippleEfectPosition = RippleEffectPositionalInfo.SMALL_WIDTH_HEIGHT;
    } else if (window.innerWidth <= sizes.smallWidth) {
      rippleEfectPosition = RippleEffectPositionalInfo.SMALL_WIDTH;
    } else if (window.innerHeight <= sizes.smallHeight) {
      rippleEfectPosition = RippleEffectPositionalInfo.SMALL_HEIGHT;
    }

    this.createRippleEffect(e, rippleEfectPosition);
  }

  private createRippleEffect(
    e: MouseEvent,
    positionalInfo: RippleEffectPositionalInfo
  ) {
    const sunContainer = e.currentTarget as HTMLElement;

    if (this.sunClickedCounter >= 20) {
      if (!this.stopClickingSunMessageShown) {
        sunContainer.style.cursor = 'initial';
        this.messageService.add({
          key: 'general',
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

    let width: string;
    let height: string;

    const distanceFromBottom = window.innerHeight - e.clientY;

    let bottom: string;
    let left: string;
    let scaleAmount: number;

    switch (positionalInfo) {
      case RippleEffectPositionalInfo.NORMAL: {
        bottom = `${50 + distanceFromBottom}px`;
        left = `${110 + e.clientX}px`;
        width = '25px';
        height = '20px';
        scaleAmount = 20;
        break;
      }
      case RippleEffectPositionalInfo.SMALL_WIDTH: {
        bottom = `40px`;
        left = `30px`;
        width = '60px';
        height = '50px';
        scaleAmount = 7;
        break;
      }
      case RippleEffectPositionalInfo.SMALL_WIDTH_HEIGHT: {
        bottom = `70px`;
        left = `50px`;
        width = '50px';
        height = '50px';
        scaleAmount = 5;
        break;
      }
      case RippleEffectPositionalInfo.SMALL_HEIGHT: {
        bottom = `${distanceFromBottom + 30}px`;
        left = `${e.clientX - 25}px`;
        width = '150px';
        height = '125px';
        scaleAmount = 2;
        break;
      }
    }

    const ripple = this.renderer.createElement('div');
    this.renderer.setStyle(ripple, 'position', 'absolute');
    this.renderer.setStyle(ripple, 'bottom', bottom);
    this.renderer.setStyle(ripple, 'left', left);
    this.renderer.setStyle(ripple, 'width', width);
    this.renderer.setStyle(ripple, 'height', height);
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
      this.renderer.setStyle(ripple, 'scale', scaleAmount);
      this.renderer.setStyle(ripple, 'background-color', 'red');
      this.renderer.setStyle(ripple, 'transform', 'translate(40%, 30%)');
    }, 20);

    setTimeout(() => {
      this.renderer.removeChild(sunContainer, ripple);
    }, 5020);
  }

  // Hack made to decide how far to move the collapse-expand button.
  returnZeroIfSmallWidth(): number {
    return window.innerWidth <= sizes.smallWidth ? 0 : 1;
  }

  private displayAppropriateNavigations() {
    if (!this.authService.isLoggedIn()) {
      this.navigationHeaders.push({
        name: 'Prijava',
        link: '/login',
        icon: 'pi-sign-in',
      });
      this.navigationHeaders.push({
        name: 'Registracija',
        link: '/register',
        icon: '',
      });
    } else {
      this.navigationHeaders.push({
        name: 'Račun',
        link: '/account',
        icon: 'pi-user-edit',
      });
      if (this.authService.isSpecialType()) {
        this.navigationHeaders.push({
          name: 'Stvaraj',
          link: '/create-task',
          icon: 'pi-pen-to-square',
        });
      }
    }
  }
}
