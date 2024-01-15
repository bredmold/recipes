import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationDetails, CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import { SessionService } from '../../services/session.service';

interface NewPasswordChallenge {
  userAttributes: any;
  requiredAttributes: any;
}

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.sass'],
})
export class SignInComponent {
  isLoading: boolean = false;
  email_address: string = '';
  password: string = '';
  new_password: string = '';

  sessionUserAttributes: any;
  passwordChallenge: boolean = false;

  constructor(
    private router: Router,
    private sessionService: SessionService,
  ) {}

  private valid(): boolean {
    return this.email_address.length > 0 && this.password.length > 0;
  }

  private authenticateUser(cognitoUser: CognitoUser): Promise<CognitoUserSession | NewPasswordChallenge> {
    return new Promise((resolve, reject) => {
      const authDetails = new AuthenticationDetails({
        Username: this.email_address,
        Password: this.password,
      });
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (cognitoSession) => resolve(cognitoSession),
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          if (userAttributes.email_verified) delete userAttributes.email_verified;
          resolve({ userAttributes: userAttributes, requiredAttributes: requiredAttributes });
        },
        onFailure: (err) => reject(err),
      });
    });
  }

  private completeNewPasswordChallenge(cognitoUser: CognitoUser): Promise<CognitoUserSession> {
    return new Promise((resolve, reject) => {
      cognitoUser.completeNewPasswordChallenge(this.new_password, this.sessionUserAttributes, {
        onSuccess: (cognitoSession) => resolve(cognitoSession),
        onFailure: (err) => reject(err),
      });
    });
  }

  private async cognitoSignIn() {
    this.passwordChallenge = false;
    const cognitoUser = this.sessionService.getCognitoUser(this.email_address);
    try {
      const authResult = await this.authenticateUser(cognitoUser);
      if (authResult instanceof CognitoUserSession) {
        this.sessionService.activateSession(cognitoUser, authResult);
        console.log('Logged In');
        await this.router.navigate(['']);
      } else {
        this.sessionUserAttributes = authResult.userAttributes;
        this.passwordChallenge = true;
      }
    } catch (e) {
      console.error(e);
      this.isLoading = false;
    }
  }

  private async completePasswordChallenge() {
    try {
      const cognitoUser = this.sessionService.getCognitoUser(this.email_address);
      const session = await this.completeNewPasswordChallenge(cognitoUser);
      this.sessionService.activateSession(cognitoUser, session);

      await this.router.navigate(['']);
      console.log('Logged in');
    } catch (err) {
      console.error(err);
      this.isLoading = false;
    }
  }

  onSignIn() {
    if (this.valid()) {
      this.isLoading = true;

      if (this.passwordChallenge) {
        this.completePasswordChallenge().then(() => {});
      } else {
        this.cognitoSignIn().then(() => {});
      }
    }
  }
}
