import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputMismatchDialogComponent } from './output-mismatch-dialog.component';

describe('OutputMismatchDialogComponent', () => {
  let component: OutputMismatchDialogComponent;
  let fixture: ComponentFixture<OutputMismatchDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutputMismatchDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutputMismatchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
