import { TestBed } from '@angular/core/testing';

import { ResponsiveLayoutService } from './responsive-layout.service';

describe('ResponsiveLayoutService', () => {
  let service: ResponsiveLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResponsiveLayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
