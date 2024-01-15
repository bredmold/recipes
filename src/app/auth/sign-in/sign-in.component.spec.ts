import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInComponent } from './sign-in.component';
import { Router, RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SessionService } from '../../services/session.service';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import {
  AuthenticationDetails,
  CognitoAccessToken,
  CognitoIdToken,
  CognitoUser,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let routerSpy: jasmine.SpyObj<Router>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  let userSpy: jasmine.SpyObj<CognitoUser>;
  let fixture: ComponentFixture<SignInComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['activateSession', 'getCognitoUser']);
    userSpy = jasmine.createSpyObj('CognitoUser', ['authenticateUser', 'completeNewPasswordChallenge']);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: SessionService,
          useValue: sessionServiceSpy,
        },
      ],
      imports: [
        MatDialogModule,
        BrowserModule,
        RouterModule,
        BrowserAnimationsModule,
        MatToolbarModule,
        MatListModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatSelectModule,
        ReactiveFormsModule,
        FormsModule,
      ],
      declarations: [SignInComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Login', () => {
    it('should log the user in', async () => {
      let authCredentials = {} as AuthenticationDetails;
      let activated = false;
      const emailHarness = await loader.getHarness(MatInputHarness.with({ selector: 'input[name="email"]' }));
      const passwordHarness = await loader.getHarness(MatInputHarness.with({ selector: 'input[name="password"]' }));
      const submitHarness = await loader.getHarness(MatButtonHarness);

      sessionServiceSpy.getCognitoUser.and.returnValue(userSpy);

      userSpy.authenticateUser.and.callFake((authDetails, callbacks) => {
        authCredentials = authDetails;
        callbacks.onSuccess(
          new CognitoUserSession({
            IdToken: new CognitoIdToken({ IdToken: 'fake' }),
            AccessToken: new CognitoAccessToken({ AccessToken: 'fake' }),
          }),
        );
      });

      sessionServiceSpy.activateSession.and.callFake(() => {
        activated = true;
      });

      await emailHarness.setValue('test@test.com');
      await passwordHarness.setValue('password');
      await submitHarness.click();
      await fixture.whenStable();

      expect(authCredentials.getUsername()).toEqual('test@test.com');
      expect(authCredentials.getPassword()).toEqual('password');
      expect(activated).toBeTrue();
      expect(component.isLoading).toBeTrue();
    });

    it('should clear the loading flag on sign-in failure', async () => {
      const emailHarness = await loader.getHarness(MatInputHarness.with({ selector: 'input[name="email"]' }));
      const passwordHarness = await loader.getHarness(MatInputHarness.with({ selector: 'input[name="password"]' }));
      const submitHarness = await loader.getHarness(MatButtonHarness);

      sessionServiceSpy.getCognitoUser.and.returnValue(userSpy);

      userSpy.authenticateUser.and.callFake((authDetails, callbacks) => {
        callbacks.onFailure(new Error('test case'));
      });

      await emailHarness.setValue('test@test.com');
      await passwordHarness.setValue('password');
      await submitHarness.click();
      await fixture.whenStable();

      expect(component.isLoading).toBeFalse();
    });

    it('should initiate a password challenge for new user', async () => {
      const emailHarness = await loader.getHarness(MatInputHarness.with({ selector: 'input[name="email"]' }));
      const passwordHarness = await loader.getHarness(MatInputHarness.with({ selector: 'input[name="password"]' }));
      const submitHarness = await loader.getHarness(MatButtonHarness);

      sessionServiceSpy.getCognitoUser.and.returnValue(userSpy);

      userSpy.authenticateUser.and.callFake((authDetails, callbacks) => {
        if (callbacks.newPasswordRequired) {
          callbacks.newPasswordRequired({ email_verified: 'thing' }, {});
        } else {
          fail('callbacks.newPasswordRequired is missing');
        }
      });

      await emailHarness.setValue('test@test.com');
      await passwordHarness.setValue('password');
      await submitHarness.click();
      await fixture.whenStable();

      expect(component.passwordChallenge).toBeTrue();
      expect(component.sessionUserAttributes).toBeDefined();
      expect(component.sessionUserAttributes.email_verified).toBeUndefined();
    });

    it('should refuse to submit with missing credentials', async () => {
      const emailHarness = await loader.getHarness(MatInputHarness.with({ selector: 'input[name="email"]' }));
      const passwordHarness = await loader.getHarness(MatInputHarness.with({ selector: 'input[name="password"]' }));
      const submitHarness = await loader.getHarness(MatButtonHarness);

      sessionServiceSpy.getCognitoUser.and.returnValue(userSpy);

      await emailHarness.setValue('');
      await passwordHarness.setValue('');
      await submitHarness.click();
      await fixture.whenStable();

      expect(component.isLoading).toBeFalse();
    });
  });

  describe('Password challenge', () => {
    it('should complete a new password challenge', async () => {
      component.passwordChallenge = true;
      component.email_address = 'test@test.com';
      component.password = 'password';
      component.sessionUserAttributes = { test: 'test' };

      fixture.detectChanges();
      await fixture.whenStable();

      const newPasswordHarness = await loader.getHarness(
        MatInputHarness.with({ selector: 'input[name="new_password"]' }),
      );
      const submitHarness = await loader.getHarness(MatButtonHarness);

      sessionServiceSpy.getCognitoUser.and.returnValue(userSpy);

      let updatedPassword = '';
      let sessionAttrs: any = {};
      let activated = false;
      userSpy.completeNewPasswordChallenge.and.callFake((newPassword, sessionUserAttributes, callbacks) => {
        updatedPassword = newPassword;
        sessionAttrs = sessionUserAttributes;
        callbacks.onSuccess(
          new CognitoUserSession({
            IdToken: new CognitoIdToken({ IdToken: 'fake' }),
            AccessToken: new CognitoAccessToken({ AccessToken: 'fake' }),
          }),
        );
      });

      sessionServiceSpy.activateSession.and.callFake(() => {
        activated = true;
      });

      await newPasswordHarness.setValue('new password');
      await submitHarness.click();
      await fixture.whenStable();

      expect(updatedPassword).toEqual('new password');
      expect(sessionAttrs).toEqual({ test: 'test' });
      expect(activated).toBeTrue();
      expect(component.isLoading).toBeTrue();
    });

    it('should clear the loading flag on password challenge failure', async () => {
      component.passwordChallenge = true;
      component.email_address = 'test@test.com';
      component.password = 'password';
      component.sessionUserAttributes = { test: 'test' };

      fixture.detectChanges();
      await fixture.whenStable();

      const newPasswordHarness = await loader.getHarness(
        MatInputHarness.with({ selector: 'input[name="new_password"]' }),
      );
      const submitHarness = await loader.getHarness(MatButtonHarness);

      sessionServiceSpy.getCognitoUser.and.returnValue(userSpy);

      userSpy.completeNewPasswordChallenge.and.callFake((newPassword, sessionUserAttributes, callbacks) => {
        callbacks.onFailure(new Error('test case'));
      });

      await newPasswordHarness.setValue('new password');
      await submitHarness.click();
      await fixture.whenStable();

      expect(component.isLoading).toBeFalse();
    });
  });
});
