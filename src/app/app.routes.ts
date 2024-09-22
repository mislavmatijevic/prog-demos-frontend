import { Routes } from '@angular/router';
import { TaskPlaygroundComponent } from './components/tasks/task-playground/task-playground.component';
import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';
import { specialTypeAuthGuard } from './guards/special-type-auth.guard';
import { AccountComponent } from './main/account/account.component';
import { ActivationComponent } from './main/activation/activation.component';
import { CreateTaskComponent } from './main/create-task/create-task.component';
import { LoginPageComponent } from './main/login-page/login-page.component';
import { PasswordResetComponent } from './main/password-reset/password-reset.component';
import { PrivacyComponent } from './main/privacy/privacy.component';
import { RegisterPageComponent } from './main/register-page/register-page.component';
import { TasksComponent } from './main/tasks/tasks.component';
import { VideosComponent } from './main/videos/videos.component';
import { WelcomeComponent } from './main/welcome/welcome.component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
  },
  {
    path: 'demos',
    component: VideosComponent,
  },
  {
    path: 'prog',
    component: TasksComponent,
  },
  {
    path: 'prog/:taskId',
    component: TaskPlaygroundComponent,
  },
  {
    path: 'login',
    canActivate: [noAuthGuard],
    component: LoginPageComponent,
  },
  {
    path: 'register',
    canActivate: [noAuthGuard],
    component: RegisterPageComponent,
  },
  {
    path: 'account',
    canActivate: [authGuard],
    component: AccountComponent,
  },
  {
    path: 'activation',
    component: ActivationComponent,
  },
  {
    path: 'create-task',
    canActivate: [authGuard, specialTypeAuthGuard],
    component: CreateTaskComponent,
  },
  {
    path: 'password-reset/:resetToken',
    canActivate: [noAuthGuard],
    component: PasswordResetComponent,
  },
  {
    path: 'privacy',
    component: PrivacyComponent,
  },
];
