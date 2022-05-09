import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {CognitoUser, CognitoUserPool, CognitoUserSession} from "amazon-cognito-identity-js";
import {environment} from "../environments/environment";

interface RecipeSession {
  user: CognitoUser,
  session: CognitoUserSession,
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly activeSession: BehaviorSubject<RecipeSession | undefined>;

  constructor() {
    this.activeSession = new BehaviorSubject<RecipeSession | undefined>(undefined)
  }

  prepareUser(email_address: string): CognitoUser {
    const poolData = {
      UserPoolId: environment.cognitoUserPoolId,
      ClientId: environment.cognitoAppClientId
    };

    const userPool = new CognitoUserPool(poolData);
    const userData = {Username: email_address, Pool: userPool};
    return new CognitoUser(userData);
  }

  activateSession(cognitoUser: CognitoUser, session: CognitoUserSession) {
    this.activeSession.next({user: cognitoUser, session: session});
  }

  deactivateSession() {
    this.activeSession.next(undefined);
  }

  isLoggedIn(): boolean {
    const session = this.activeSession.getValue();
    return !!session;
  }

  loggedInEmail(): string | undefined {
    const session = this.activeSession.getValue();
    return session ? session.user.getUsername() : undefined;
  }
}
