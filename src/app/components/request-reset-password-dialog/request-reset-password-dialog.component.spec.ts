import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestResetPasswordDialogComponent } from './request-reset-password-dialog.component';

describe('RequestResetPasswordDialogComponent', () => {
  let component: RequestResetPasswordDialogComponent;
  let fixture: ComponentFixture<RequestResetPasswordDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestResetPasswordDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestResetPasswordDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
