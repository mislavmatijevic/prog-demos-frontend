import { Routes } from '@angular/router';
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
];
