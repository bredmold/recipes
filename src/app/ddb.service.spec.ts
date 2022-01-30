import { TestBed } from '@angular/core/testing';

import { DdbService } from './ddb.service';

describe('DdbService', () => {
  let service: DdbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DdbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
