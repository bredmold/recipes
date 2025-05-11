import { HttpRequest as SmithyHttpRequest } from '@smithy/types';
import { HttpEvent, HttpHandlerFn, HttpHeaders, HttpRequest } from '@angular/common/http';
import { mergeMap, Observable } from 'rxjs';
import { SessionService } from '../services/session.service';
import { inject } from '@angular/core';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { CognitoIdentityCredentials } from '@aws-sdk/credential-provider-cognito-identity';
import { environment } from '../../environments/environment';
import { SignatureV4 } from '@smithy/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';

class NotLoggedInError extends Error {
  constructor() {
    super('No logged-in user');
  }

  override name = 'NotLoggedInError';
}

function convertToAwsQuery(url: URL): Record<string, string> {
  let query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => (query[key] = value));
  return query;
}

function convertToAwsHeaders(angularRq: HttpRequest<unknown>): Record<string, string> {
  let headers: Record<string, string> = {};
  angularRq.headers.keys().forEach((key: string) => (headers[key] = angularRq.headers.get(key) as string));
  return headers;
}

function signingUrl(requestUrl: string): URL {
  const signingUrl = (() => {
    const { backendUrl, apiGatewayUrl } = environment;
    if (requestUrl.startsWith(backendUrl)) return requestUrl.replace(backendUrl, apiGatewayUrl);
    else return requestUrl;
  })();

  return new URL(signingUrl);
}

function convertToAwsRequest(angularRq: HttpRequest<unknown>): SmithyHttpRequest {
  const url = signingUrl(angularRq.url);
  const awsHeaders = convertToAwsHeaders(angularRq);
  awsHeaders['host'] = url.host;

  return {
    protocol: url.protocol,
    hostname: url.hostname,
    path: url.pathname,
    query: convertToAwsQuery(url),
    method: angularRq.method,
    body: angularRq.body,
    headers: awsHeaders,
  };
}

async function signRequest(
  angularRq: HttpRequest<unknown>,
  credentials: CognitoIdentityCredentials,
): Promise<HttpRequest<unknown>> {
  const sigv4 = new SignatureV4({
    credentials: credentials,
    region: environment.region,
    service: 'execute-api',
    sha256: Sha256,
  });

  console.log(angularRq);
  const awsRq = convertToAwsRequest(angularRq);
  console.log(awsRq);
  const signedAwsRq = await sigv4.sign(awsRq);
  console.log(signedAwsRq);

  // Copy all the headers from the signed request
  const signedHeaders = new HttpHeaders(signedAwsRq.headers);
  const signedAngularRq = angularRq.clone({ headers: signedHeaders.delete('host') });
  console.log(signedAngularRq);
  return signedAngularRq;
}

export function apiGatewayRequestSigner(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const sessionService = inject(SessionService);
  console.log(`auth interceptor: loggedInEmail=${sessionService.loggedInEmail()}`);

  const credentialsPromise = sessionService.sessionCredentials();
  const credentialsObservable = fromPromise(credentialsPromise);
  return credentialsObservable
    .pipe(
      mergeMap((credentials) => {
        if (credentials) {
          console.log(`identityId=${credentials.identityId}`);
          return fromPromise(signRequest(req, credentials));
        } else throw new NotLoggedInError();
      }),
    )
    .pipe(mergeMap((signedRequest) => next(signedRequest)));
}
