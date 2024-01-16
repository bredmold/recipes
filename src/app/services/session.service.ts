import { Inject, Injectable, InjectionToken } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CognitoUser, CognitoUserPool, CognitoUserSession } from 'amazon-cognito-identity-js';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { CognitoIdentityCredentials, fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { environment } from '../../environments/environment';

export const COGNITO_IDENTITY_CLIENT = new InjectionToken<CognitoIdentityClient>('Cognito Identity Client', {
  providedIn: 'root',
  factory: () => new CognitoIdentityClient({ region: environment.region }),
});

interface RecipeSession {
  user: CognitoUser;
  session: CognitoUserSession;
  credentials?: CognitoIdentityCredentials;
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly activeSession: BehaviorSubject<RecipeSession | undefined>;
  private readonly userPool: CognitoUserPool;

  constructor(@Inject(COGNITO_IDENTITY_CLIENT) private readonly cognitoIdentityClient: CognitoIdentityClient) {
    this.activeSession = new BehaviorSubject<RecipeSession | undefined>(undefined);
    this.userPool = new CognitoUserPool({
      UserPoolId: environment.cognito.userPoolId,
      ClientId: environment.cognito.clientId,
    });
  }

  activateSession(cognitoUser: CognitoUser, session: CognitoUserSession) {
    this.activeSession.next({ user: cognitoUser, session: session });
  }

  private signOut(cognitoUser: CognitoUser): Promise<void> {
    return new Promise((resolve) => {
      cognitoUser.signOut(() => resolve());
    });
  }

  async deactivateSession() {
    const session = this.activeSession.getValue();
    if (session) {
      await this.signOut(session.user);
      this.activeSession.next(undefined);
    }
  }

  getCognitoUser(email: string): CognitoUser {
    return new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });
  }

  isLoggedIn(): boolean {
    const session = this.activeSession.getValue();
    return !!session;
  }

  loggedInEmail(): string {
    const session = this.activeSession.getValue();
    if (session) return session.user.getUsername();
    else throw 'No active session';
  }

  async sessionCredentials(): Promise<CognitoIdentityCredentials | undefined> {
    const session = this.activeSession.getValue();
    if (session) {
      if (!session.credentials) {
        const userPoolUrl = `cognito-idp.${environment.region}.amazonaws.com/${environment.cognito.userPoolId}`;
        const credentialsProvider = fromCognitoIdentityPool({
          client: this.cognitoIdentityClient,
          identityPoolId: environment.cognito.identityPoolId,
          logins: {
            [userPoolUrl]: session.session.getIdToken().getJwtToken(),
          },
        });
        session.credentials = await credentialsProvider();
      }
      return session.credentials;
    } else {
      return Promise.resolve(undefined);
    }
  }
}
