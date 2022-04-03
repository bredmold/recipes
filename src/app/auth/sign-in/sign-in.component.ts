import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {NgForm} from "@angular/forms";
import {AuthenticationDetails, CognitoUser} from 'amazon-cognito-identity-js';
import {SessionService} from "../../session.service";

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

  private signIn() {
    this.passwordChallenge = false;
    const authenticationDetails = new AuthenticationDetails({
      Username: this.email_address,
      Password: this.password,
    });

    this.prepareUser().authenticateUser(authenticationDetails, {
      newPasswordRequired: (userAttributes) => {
        delete userAttributes.email;
        delete userAttributes.email_verified;
        this.sessionUserAttributes = userAttributes;
        this.passwordChallenge = true;
      },
      onSuccess: (cognitoSession) => {
        this.sessionService.activateSession(this.prepareUser(), cognitoSession);
        this.router.navigate(['']).then(
          () => {
            console.log('Logged in');
          },
          err => {
            console.error(err);
          }
        );
      },
      onFailure: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  private completePasswordChallenge() {
    this.prepareUser().completeNewPasswordChallenge(this.new_password, this.sessionUserAttributes, {
      mfaSetup: () => {},
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
