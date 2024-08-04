import { Routes } from '@angular/router';
import { VideoPlaybackComponent } from './components/videos/video-playback/video-playback.component';
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
];
