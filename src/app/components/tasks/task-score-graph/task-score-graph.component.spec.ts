import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskScoreGraphComponent } from './task-score-graph.component';

describe('TaskScoreGraphComponent', () => {
  let component: TaskScoreGraphComponent;
  let fixture: ComponentFixture<TaskScoreGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskScoreGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskScoreGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
