import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { specialTypeAuthGuard } from './special-type-auth.guard';

describe('specialTypeAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => specialTypeAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
