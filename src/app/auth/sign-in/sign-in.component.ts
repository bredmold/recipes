import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import { SessionService } from '../../services/session.service';
import { Auth } from 'aws-amplify';

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

  private cognitoUser?: CognitoUser = undefined;

  constructor(private router: Router, private sessionService: SessionService) {}

  private valid(): boolean {
    return this.email_address.length > 0 && this.password.length > 0;
  }

  private async signIn() {
    this.passwordChallenge = false;

    try {
      const user = await Auth.signIn(this.email_address, this.password);
      if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
        this.cognitoUser = user;
        this.sessionUserAttributes = user.challengeParam;
        this.passwordChallenge = true;
      } else {
        const session: CognitoUserSession = await Auth.currentSession();
        this.sessionService.activateSession(user, session);

        await this.router.navigate(['']);
        console.log('Logged in');
      }
    } catch (err) {
      console.error(err);
      this.isLoading = false;
    }
  }

  private async completePasswordChallenge() {
    try {
      const user = await Auth.completeNewPassword(this.cognitoUser, this.new_password);
      const session: CognitoUserSession = await Auth.currentSession();
      this.sessionService.activateSession(user, session);

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
        this.signIn().then(() => {});
      }
    }
  }
}
