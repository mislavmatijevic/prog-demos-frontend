import { Routes } from '@angular/router';
import { TaskPlaygroundComponent } from './components/tasks/task-playground/task-playground.component';
import { VideoPlaybackComponent } from './components/videos/video-playback/video-playback.component';
import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';
import { AccountComponent } from './main/account/account.component';
import { LoginPageComponent } from './main/login-page/login-page.component';
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
    path: 'demos/:videoId',
    component: VideoPlaybackComponent,
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
];
