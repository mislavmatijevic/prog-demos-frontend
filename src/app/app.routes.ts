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
    title: 'Prog Demos',
  },
  {
    path: 'demos',
    component: VideosComponent,
    title: 'Prog Demos | Uči',
  },
  {
    path: 'prog',
    component: TasksComponent,
    title: 'Prog Demos | Vježbaj',
  },
  {
    path: 'prog/:taskId',
    component: TaskPlaygroundComponent,
    title: 'Učitavanje zadatka...',
  },
  {
    path: 'login',
    canActivate: [noAuthGuard],
    component: LoginPageComponent,
    title: 'Prog Demos | Prijava',
  },
  {
    path: 'register',
    canActivate: [noAuthGuard],
    component: RegisterPageComponent,
    title: 'Prog Demos | Registracija',
  },
  {
    path: 'account',
    canActivate: [authGuard],
    component: AccountComponent,
    title: 'Prog Demos | Račun',
  },
  {
    path: 'activation',
    component: ActivationComponent,
    title: 'Prog Demos | Aktivacija',
  },
  {
    path: 'create-task',
    canActivate: [authGuard, specialTypeAuthGuard],
    component: CreateTaskComponent,
    title: 'Prog Demos | Stvaranje zadatka',
  },
  {
    path: 'password-reset/:resetToken',
    canActivate: [noAuthGuard],
    component: PasswordResetComponent,
    title: 'Prog Demos | Obnova lozinke',
  },
  {
    path: 'privacy',
    component: PrivacyComponent,
    title: 'Prog Demos | Obavijest o privatnosti',
  },
];
