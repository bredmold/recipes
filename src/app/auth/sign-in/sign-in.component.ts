import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {NgForm} from "@angular/forms";
import {AuthenticationDetails, CognitoUser, CognitoUserPool} from 'amazon-cognito-identity-js';
import {environment} from 'src/environments/environment';
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

  constructor(private router: Router, private sessionService: SessionService) {
  }

  onSignIn(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      const authenticationDetails = new AuthenticationDetails({
        Username: this.email_address,
        Password: this.password,
      });
      const poolData = {
        UserPoolId: environment.cognitoUserPoolId,
        ClientId: environment.cognitoAppClientId
      };

      const userPool = new CognitoUserPool(poolData);
      const userData = {Username: this.email_address, Pool: userPool};
      const cognitoUser = new CognitoUser(userData);

      cognitoUser.authenticateUser(authenticationDetails, {
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          delete userAttributes.email_verified;
          // TODO re-direct to change password flow
        },
        onSuccess: (cognitoSession) => {
          this.sessionService.activateSession(cognitoUser, cognitoSession);
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
          alert(err.message || JSON.stringify(err));
          this.isLoading = false;
        },
      });
    }
  }
}
