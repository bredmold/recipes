import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {CognitoAccessToken, CognitoUser, CognitoUserSession} from "amazon-cognito-identity-js";

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

  activateSession(user: CognitoUser, session: CognitoUserSession) {
    this.activeSession.next({user: user, session: session});
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

  awsToken(): CognitoAccessToken | undefined {
    const session = this.activeSession.getValue();
    return session ? session.session.getAccessToken() : undefined;
  }
}
