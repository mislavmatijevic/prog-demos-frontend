import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskPlaygroundComponent } from './task-playground.component';

describe('TaskPlaygroundComponent', () => {
  let component: TaskPlaygroundComponent;
  let fixture: ComponentFixture<TaskPlaygroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskPlaygroundComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskPlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
