import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoPlaybackComponent } from './video-playback.component';

describe('VideoPlaybackComponent', () => {
  let component: VideoPlaybackComponent;
  let fixture: ComponentFixture<VideoPlaybackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoPlaybackComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VideoPlaybackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
