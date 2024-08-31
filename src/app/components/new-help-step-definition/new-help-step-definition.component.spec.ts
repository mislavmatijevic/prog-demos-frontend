import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewHelpStepDefinitionComponent } from './new-help-step-definition.component';

describe('NewHelpStepDefinitionComponent', () => {
  let component: NewHelpStepDefinitionComponent;
  let fixture: ComponentFixture<NewHelpStepDefinitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewHelpStepDefinitionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewHelpStepDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
