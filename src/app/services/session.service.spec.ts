import { TestBed } from '@angular/core/testing';

import { SessionService } from './session.service';
import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';

describe('SessionService', () => {
  let service: SessionService;
  let userSpy: jasmine.SpyObj<CognitoUser>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);

    userSpy = jasmine.createSpyObj('CognitoUser', ['signOut']);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a Cognito user based on email', () => {
    const user = service.getCognitoUser('joe.blow@test.com');
    expect(user).toBeInstanceOf(CognitoUser);
    expect(user.getUsername()).toEqual('joe.blow@test.com');
  });

  describe('deactivateSession', () => {
    it('should sign out the user on deactivateSession', async () => {
      service.activateSession(userSpy, {} as CognitoUserSession);

      let signedOut = false;
      userSpy.signOut.and.callFake((callback) => {
        signedOut = true;
        if (callback) callback();
        else fail('Expected signout callback');
      });

      await service.deactivateSession();
      expect(service.isLoggedIn()).toBeFalse();
      expect(signedOut).toBeTrue();
    });
  });

  describe('activateSession', () => {
    it('isLoggedIn should return false before activation', () => {
      expect(service.isLoggedIn()).toBeFalse();
    });

    it('isLoggedIn should return true after activation', () => {
      const user = service.getCognitoUser('joe.blow@test.com');
      service.activateSession(user, {} as CognitoUserSession);
      expect(service.isLoggedIn()).toBeTrue();
    });

    it('loggedInEmail should throw before activation', () => {
      expect(() => service.loggedInEmail()).toThrow();
    });

    it('loggedInEmail should return the username after activation', () => {
      const user = service.getCognitoUser('joe.blow@test.com');
      service.activateSession(user, {} as CognitoUserSession);
      expect(service.loggedInEmail()).toEqual('joe.blow@test.com');
    });

    it('should not return session credentials before activation', async () => {
      const credentials = await service.sessionCredentials();
      expect(credentials).toBeUndefined();
    });
  });
});
