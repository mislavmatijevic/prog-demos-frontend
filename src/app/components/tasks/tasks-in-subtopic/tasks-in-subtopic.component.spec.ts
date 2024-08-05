import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksInSubtopicComponent } from './tasks-in-subtopic.component';

describe('TasksInSubtopicComponent', () => {
  let component: TasksInSubtopicComponent;
  let fixture: ComponentFixture<TasksInSubtopicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksInSubtopicComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TasksInSubtopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
