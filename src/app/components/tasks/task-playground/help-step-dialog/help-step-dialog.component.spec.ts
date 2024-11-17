import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpStepDialogComponent } from './help-step-dialog.component';

describe('HelpStepDialogComponent', () => {
  let component: HelpStepDialogComponent;
  let fixture: ComponentFixture<HelpStepDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpStepDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpStepDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
