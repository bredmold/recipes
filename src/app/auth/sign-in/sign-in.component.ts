import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {NgForm} from "@angular/forms";
import {CognitoUser, CognitoUserSession} from 'amazon-cognito-identity-js';
import {SessionService} from "../../session.service";
import {Auth} from 'aws-amplify';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.sass']
})
export class SignInComponent {
  isLoading: boolean = false;
  email_address: string = "";
  password: string = "";
  new_password: string = '';

  sessionUserAttributes: any;
  passwordChallenge: boolean = false;

  private cognitoUser?: CognitoUser = undefined;

  constructor(private router: Router, private sessionService: SessionService) {
  }

  private prepareUser(): CognitoUser {
    if (this.cognitoUser) {
      return this.cognitoUser;
    } else {
      this.cognitoUser = this.sessionService.prepareUser(this.email_address);
      return this.cognitoUser;
    }
  }

  private async signIn() {
    this.passwordChallenge = false;

    try {
      const user: CognitoUser = await Auth.signIn(this.email_address, this.password);
      const session: CognitoUserSession = await Auth.currentSession();
      this.sessionService.activateSession(user, session);

      await this.router.navigate([''])
      console.log('Logged in');
    } catch (err) {
      console.error(err);
      this.isLoading = false;
    }
  }

  private completePasswordChallenge() {
    this.prepareUser().completeNewPasswordChallenge(this.new_password, this.sessionUserAttributes, {
      mfaSetup: () => {
      },
      onSuccess: cognitoSession => {
        this.sessionService.activateSession(this.prepareUser(), cognitoSession);
        this.isLoading = false;
        this.passwordChallenge = false;
        this.cognitoUser = undefined;
        this.router.navigate(['']).then(
          () => {
            console.log('Logged in after password challenge');
          },
          err => {
            console.error(err);
          }
        );
      },
      onFailure: err => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  onSignIn(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;

      if (this.passwordChallenge) {
        this.completePasswordChallenge();
      } else {
        this.signIn();
      }
    }
  }
}
