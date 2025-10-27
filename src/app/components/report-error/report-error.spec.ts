import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportError } from './report-error';

describe('ReportError', () => {
  let component: ReportError;
  let fixture: ComponentFixture<ReportError>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportError]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportError);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
