import { ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { SessionService } from '../services/session.service';
import { TestBed } from '@angular/core/testing';
import { authGuard } from './auth.guard';
import { fakeRouterState } from '../utils.spec';

describe('authGuard', () => {
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  const dummyRoute = {} as ActivatedRouteSnapshot;

  beforeEach(() => {
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['isLoggedIn']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: SessionService,
          useValue: sessionServiceSpy,
        },
      ],
    });
  });

  it('should re-direct an anonymous user to the login page', async () => {
    sessionServiceSpy.isLoggedIn.and.returnValue(false);
    const guardResult = await TestBed.runInInjectionContext(() => authGuard(dummyRoute, fakeRouterState('/')));
    expect(guardResult).toBeInstanceOf(UrlTree);
  });

  it('should allow a logged-in user to proceed', async () => {
    sessionServiceSpy.isLoggedIn.and.returnValue(true);
    const guardResult = await TestBed.runInInjectionContext(() => authGuard(dummyRoute, fakeRouterState('/')));
    expect(guardResult).toBeTrue();
  });
});
