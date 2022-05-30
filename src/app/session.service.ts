import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {CognitoUser, CognitoUserSession} from "amazon-cognito-identity-js";
import {Auth} from "aws-amplify";
import {ICredentials} from "aws-amplify/lib/Common/types/types";

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

  activateSession(cognitoUser: CognitoUser, session: CognitoUserSession) {
    this.activeSession.next({user: cognitoUser, session: session});
  }

  async deactivateSession() {
    await Auth.signOut();
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

  sessionCredentials(): ICredentials {
    return Auth.Credentials.get();
  }
}
